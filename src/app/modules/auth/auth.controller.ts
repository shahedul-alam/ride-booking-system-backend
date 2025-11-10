import httpStatus from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import passport from "passport";
import { catchAsync } from "../../utils/catchAsync";
import AppError from "../../errorHelpers/appError";
import { createUserToken } from "../../utils/token";
import { setAuthCookie } from "../../utils/setCookie";
import { sendResponse } from "../../utils/sendResponse";
import { authServices } from "./auth.service";
import { JwtPayload } from "jsonwebtoken";

const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    passport.authenticate("local", async (err: any, user: any, info: any) => {
      if (err) {
        return next(
          new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "Authentication service error."
          )
        );
      }

      if (!user) {
        return next(
          new AppError(
            httpStatus.UNAUTHORIZED,
            info.message || "Invalid credentials."
          )
        );
      }

      const userTokens = createUserToken(user);

      setAuthCookie(res, userTokens);

      const userObject = user.toObject();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = userObject;

      sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User logged in successfully",
        data: {
          accessToken: userTokens.accessToken,
          refreshToken: userTokens.refreshToken,
          user: rest,
        },
      });
    })(req, res, next);
  }
);

const getNewAccessToken = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "No refresh token received from cookies"
      );
    }

    const newAccessToken = await authServices.getNewAccessToken(refreshToken);

    setAuthCookie(res, newAccessToken);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "New access token retrieved successfully",
      data: newAccessToken,
    });
  }
);

const logout = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User logged out successfully",
      data: null,
    });
  }
);

const changePassword = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction) => {
    const { newPassword, oldPassword } = req.body;
    const decodedToken = req.user;

    await authServices.changePassword(
      newPassword,
      oldPassword,
      decodedToken as JwtPayload
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Password changed successfully",
      data: null,
    });
  }
);

const resetPassword = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction) => {
    const { newPassword, id } = req.body;
    const decodedToken = req.user;

    await authServices.resetPassword(
      newPassword,
      id,
      decodedToken as JwtPayload
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Password reset successfully",
      data: null,
    });
  }
);

const setPassword = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction) => {
    const { password } = req.body;
    const { userId } = req.user as JwtPayload;

    await authServices.setPassword(userId, password);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Password set successfully",
      data: null,
    });
  }
);

export const authControllers = {
  credentialsLogin,
  getNewAccessToken,
  logout,
  changePassword,
  resetPassword,
  setPassword,
};
