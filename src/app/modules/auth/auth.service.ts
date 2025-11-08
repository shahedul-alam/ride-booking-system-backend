import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import envVars from "../../config/env";
import { verifyToken } from "../../utils/jwt";
import User from "../user/user.model";
import AppError from "../../errorHelpers/appError";
import { IsActive } from "../user/user.interface";
import { createNewAccessTokenWithRefreshToken } from "../../utils/token";

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

export const authServices = {
  getNewAccessToken,
};
