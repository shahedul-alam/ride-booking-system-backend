import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest.middleware";
import { checkAuth } from "../../middlewares/checkAuth.middleware";
import { Role } from "../user/user.interface";
import { createRideZodSchema } from "./ride.validation";
import rideControllers from "./ride.controller";
import { checkActiveRideStatus } from "../../middlewares/checkActiveRideStatus.middleware";

const router = Router();

router.post(
  "/request",
  checkAuth(Role.USER),
  validateRequest(createRideZodSchema),
  checkActiveRideStatus(),
  rideControllers.createRide
);

const rideRoutes = router;
export default rideRoutes;
