import bcryptjs from "bcryptjs";
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

export const authServices = {
  getNewAccessToken,
  changePassword,
};
