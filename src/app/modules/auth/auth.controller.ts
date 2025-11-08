import httpStatus from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import passport from "passport";
import { catchAsync } from "../../utils/catchAsync";
import AppError from "../../errorHelpers/appError";
import { createUserToken } from "../../utils/token";
import { setAuthCookie } from "../../utils/setCookie";
import { sendResponse } from "../../utils/sendResponse";

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

export const authControllers = {
  credentialsLogin,
};
