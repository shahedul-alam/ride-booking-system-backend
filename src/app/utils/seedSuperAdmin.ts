/* eslint-disable no-console */
import bcryptjs from "bcryptjs";
import envVars from "../config/env";
import User from "../modules/user/user.model";
import { IAuthProvider, IUser, Role } from "../modules/user/user.interface";

const seedSuperAdmin = async () => {
  try {
    const superAdminEmail = envVars.SUPER_ADMIN.SUPER_ADMIN_EMAIL;
    const superAdminPass = envVars.SUPER_ADMIN.SUPER_ADMIN_PASSWORD;

    const isSuperAdminExists = await User.findOne({ email: superAdminEmail });

    if (isSuperAdminExists) {
      console.log("Super admin already exists!");
      return;
    }

    const hashedPassword = await bcryptjs.hash(
      superAdminPass,
      envVars.BCRYPT_SALT_ROUND
    );

    const authProvider: IAuthProvider = {
      provider: "credentials",
      providerId: superAdminEmail,
    };

    const payload: IUser = {
      name: "Super Admin",
      email: superAdminEmail,
      role: Role.SUPER_ADMIN,
      password: hashedPassword,
      isVerified: true,
      auths: [authProvider],
    };

    await User.create(payload);
  } catch (err) {
    console.error(err);
  }
};

export default seedSuperAdmin;
