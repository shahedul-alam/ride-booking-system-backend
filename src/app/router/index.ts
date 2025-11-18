import { Router } from "express";
import userRoutes from "../modules/user/user.route";
import authRoutes from "../modules/auth/auth.route";
import OtpRoutes from "../modules/otp/otp.route";
import driverRoutes from "../modules/driver/driver.route";

const router = Router(); // router initialized

const moduleRoutes = [
  {
    path: "/user",
    route: userRoutes,
  },
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/otp",
    route: OtpRoutes,
  },
  {
    path: "/driver",
    route: driverRoutes,
  },
];

// e.g. router.use("/user", userRoutes)
moduleRoutes.forEach(({ path, route }) => router.use(path, route)); 

export default router;