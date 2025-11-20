import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest.middleware";
import {
  createDriverZodSchema,
  updateDriverZodSchema,
} from "./driver.validation";
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

router.patch(
  "/availability",
  checkAuth(Role.DRIVER),
  validateRequest(updateDriverZodSchema),
  driverControllers.updateDriverAvailability
);

router.get(
  "/earnings",
  checkAuth(Role.DRIVER),
  driverControllers.earnings
);

const driverRoutes = router;
export default driverRoutes;
