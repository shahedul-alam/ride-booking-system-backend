import AppError from "../../errorHelpers/appError";
import httpStatus from "http-status-codes";
import User from "./user.model";
import bcryptjs from "bcryptjs";
import { IAuthProvider, IUser } from "./user.interface";
import envVars from "../../config/env";

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

const userServices = {
  createUser,
};

export default userServices;
