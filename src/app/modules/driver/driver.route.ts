import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest.middleware";
import { createDriverZodSchema } from "./driver.validation";
import driverControllers from "./driver.controller";
import { checkAuth } from "../../middlewares/checkAuth.middleware";
import { Role } from "../user/user.interface";

const router = Router();

router.post(
  "/register",
  checkAuth(Role.USER),
  validateRequest(createDriverZodSchema),
  driverControllers.createDriver
);


const driverRoutes = router;
export default driverRoutes;