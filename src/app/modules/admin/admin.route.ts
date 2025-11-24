import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth.middleware";
import { Role } from "../user/user.interface";
import adminControllers from "./admin.controller";

const router = Router();

router.get(
  "/users",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  adminControllers.getAllUser
);

router.get(
  "/users/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  adminControllers.getSingleUser
);

router.get(
  "/drivers",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  adminControllers.getAllDriver
);

router.get(
  "/rides",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  adminControllers.getAllRides
);

router.patch(
  "/users/:id/status",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  adminControllers.updateUserActiveStatus
);

router.get(
  "/drivers/:id/approval-status",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  adminControllers.updateDriverApprovalStatus
);

const adminRoutes = router;

export default adminRoutes;
