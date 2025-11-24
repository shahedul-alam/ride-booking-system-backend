import AppError from "../../errorHelpers/appError";
import httpStatus from "http-status-codes";
import User from "./user.model";
import bcryptjs from "bcryptjs";
import { IAuthProvider, IUser, Role } from "./user.interface";
import envVars from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  const isUserEXists = await User.findOne({ email });

  if (isUserEXists) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already exists");
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    envVars.BCRYPT_SALT_ROUND
  );

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: email as string,
  };

  const user = await User.create({
    email,
    password: hashedPassword,
    auths: [authProvider],
    ...rest,
  });

  return user;
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  if (decodedToken.role === Role.USER || decodedToken.role === Role.DRIVER) {
    if (userId !== decodedToken.userId) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Your are not authorized.");
    }
  }

  const isUserExists = await User.findById(userId).select("-password");

  if (!isUserExists) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found.");
  }

  if (
    decodedToken.role === Role.ADMIN ||
    isUserExists.role === Role.SUPER_ADMIN
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Your are not authorized.");
  }

  if (payload.role) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.DRIVER) {
      throw new AppError(httpStatus.FORBIDDEN, "Forbidden access.");
    }
  }

  if (payload.isActive || payload.isDeleted || payload.isVerified) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.DRIVER) {
      throw new AppError(httpStatus.FORBIDDEN, "Forbidden access.");
    }
  }

  const updatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found for update.");
  }

  const userObject = updatedUser.toObject();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = userObject;

  return rest;
};

const getMe = async (userId: string) => {
  const user = await User.findById(userId).select("-password");

  return user;
};

const userServices = {
  createUser,
  updateUser,
  getMe,
};

export default userServices;
