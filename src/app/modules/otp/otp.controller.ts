import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import OTPService from "./otp.service";

const sendUserVerificationOTP = catchAsync(
  async (req: Request, res: Response) => {
    const { email, name } = req.body;

    await OTPService.sendUserVerificationOTP(email, name);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "OTP send successfully",
      data: null,
    });
  }
);

const verifyUserVerificationOTP = catchAsync(
  async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    await OTPService.verifyUserVerificationOTP(email, otp);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "OTP verified successfully",
      data: null,
    });
  }
);

const OTPController = {
  sendUserVerificationOTP,
  verifyUserVerificationOTP,
};

export default OTPController;
