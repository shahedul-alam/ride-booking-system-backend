import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import envVars from "../../config/env";
import { verifyToken } from "../../utils/jwt";
import User from "../user/user.model";
import AppError from "../../errorHelpers/appError";
import { IAuthProvider, IsActive } from "../user/user.interface";
import { createNewAccessTokenWithRefreshToken } from "../../utils/token";
import jwt from "jsonwebtoken";
import sendEmail from "../../utils/sendEmail";

const getNewAccessToken = async (refreshToken: string) => {
  const verifiedRefreshToken = verifyToken(
    refreshToken,
    envVars.JWT.JWT_REFRESH_SECRET
  ) as JwtPayload;

  const user = await User.findOne({
    email: verifiedRefreshToken.email,
  });

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "Account does not exist.");
  }

  if (
    user.isActive === IsActive.BLOCKED ||
    user.isActive === IsActive.INACTIVE
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Account is suspended. Contact administrator."
    );
  }

  if (user.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, "Account is deleted.");
  }

  const newAccessToken = createNewAccessTokenWithRefreshToken(user);

  return {
    accessToken: newAccessToken,
  };
};

const changePassword = async (
  newPassword: string,
  oldPassword: string,
  decodedToken: JwtPayload
) => {
  const user = await User.findById(decodedToken.userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found.");
  }

  const isOldPasswordMatch = await bcryptjs.compare(
    oldPassword,
    user?.password as string
  );

  if (!isOldPasswordMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Old password does not match.");
  }

  user.password = await bcryptjs.hash(newPassword, envVars.BCRYPT_SALT_ROUND);

  user?.save();

  return;
};

const resetPassword = async (
  newPassword: string,
  id: string,
  decodedToken: JwtPayload
) => {
  if (id !== decodedToken.userId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "You can not rest your password."
    );
  }

  const user = await User.findById(decodedToken.userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found.");
  }

  user.password = await bcryptjs.hash(newPassword, envVars.BCRYPT_SALT_ROUND);

  user?.save();

  return;
};

const setPassword = async (userId: string, password: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found.");
  }

  if (
    user.password &&
    user.auths.some((providerObj) => providerObj.provider === "google")
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "A password has already been set for this account. Please go to your profile to change it."
    );
  }

  user.password = await bcryptjs.hash(password, envVars.BCRYPT_SALT_ROUND);

  const credentialProvider: IAuthProvider = {
    provider: "credentials",
    providerId: user.email,
  };

  user.auths = [...user.auths, credentialProvider];

  user?.save();

  return;
};

const forgotPassword = async (email: string) => {
  if (!email) {
    throw new AppError(httpStatus.NOT_FOUND, "Email not found.");
  }

  const isUserEXists = await User.findOne({ email });

  if (!isUserEXists) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exist.");
  }

  // if (!isUserEXists.isVerified) {
  //   throw new AppError(httpStatus.BAD_REQUEST, "User is not verified.");
  // }

  if (
    isUserEXists.isActive === IsActive.BLOCKED ||
    isUserEXists.isActive === IsActive.INACTIVE
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `User is ${isUserEXists.isActive}.`
    );
  }

  if (isUserEXists.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is deleted.");
  }

  const jwtPayload = {
    userId: isUserEXists._id,
    email: isUserEXists.email,
    role: isUserEXists.role,
  };

  const resetToken = jwt.sign(jwtPayload, envVars.JWT.JWT_ACCESS_SECRET, {
    expiresIn: "10m",
  });

  const resetLink = `${envVars.FRONTEND_URL}/reset-password?id=${isUserEXists._id}&token=${resetToken}`;

  sendEmail({
    to: isUserEXists.email,
    subject: "Password Reset",
    templateName: "forgetPassword",
    templateData: {
      name: isUserEXists.name,
      resetLink,
    },
  });
};

export const authServices = {
  getNewAccessToken,
  changePassword,
  resetPassword,
  setPassword,
  forgotPassword,
};
