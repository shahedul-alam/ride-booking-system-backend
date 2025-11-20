import crypto from "crypto";
import { redisClient } from "../../config/redis.config";
import AppError from "../../errorHelpers/appError";
import User from "../user/user.model";
import sendEmail from "../../utils/sendEmail";

const OTP_EXPIRATION = 2 * 60;

const generateOtp = (length = 6) => {
  const otp = crypto.randomInt(10 ** (length - 1), 10 ** length).toString();

  return otp;
};

const sendUserVerificationOTP = async (email: string, name: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(404, "User not found.");
  }

  if (user?.isVerified) {
    throw new AppError(401, "You are already verified.");
  }

  const otp = generateOtp();

  const redisKey = `otp:${email}`;

  await redisClient.set(redisKey, otp, {
    expiration: {
      type: "EX", // <-- This defines the unit
      value: OTP_EXPIRATION, // <-- This is the value (e.g., 120)
    },
  });

  await sendEmail({
    to: email,
    subject: "Your OTP Code",
    templateName: "otp",
    templateData: {
      name: name,
      otp: otp,
    },
  });
};

const verifyUserVerificationOTP = async (email: string, otp: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(404, "User not found.");
  }

  if (user?.isVerified) {
    throw new AppError(401, "You are already verified.");
  }

  const redisKey = `otp:${email}`;

  const savedOtp = await redisClient.get(redisKey);

  if (!savedOtp) {
    throw new AppError(401, "Invalid OTP.");
  }

  if (savedOtp !== otp) {
    throw new AppError(401, "Invalid OTP.");
  }

  await Promise.all([
    User.updateOne({ email }, { isVerified: true }, { runValidators: true }),
    redisClient.del([redisKey]),
  ]);
};

const OTPService = {
  sendUserVerificationOTP,
  verifyUserVerificationOTP,
};

export default OTPService;
