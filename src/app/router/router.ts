import { Router } from "express";
import userRoutes from "../modules/user/user.route";

const router = Router(); // router initialized

const moduleRoutes = [
  {
    path: "/user",
    route: userRoutes,
  },
];

// e.g. router.use("/user", userRoutes)
moduleRoutes.forEach(({ path, route }) => router.use(path, route)); 

export default router;