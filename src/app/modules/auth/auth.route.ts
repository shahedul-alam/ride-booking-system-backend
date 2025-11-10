import { Router } from "express";
import { authControllers } from "./auth.controller";
import { checkAuth } from "../../middlewares/checkAuth.middleware";
import { Role } from "../user/user.interface";

const router = Router();

router.post("/login", authControllers.credentialsLogin);
router.get("/google", authControllers.googleInitiate);
router.get("/google/callback", authControllers.googleCallback);
router.post("/refresh-token", authControllers.getNewAccessToken);
router.post("/logout", authControllers.logout);
router.post(
  "/change-password",
  checkAuth(...Object.values(Role)),
  authControllers.changePassword
);
router.post(
  "/reset-password",
  checkAuth(...Object.values(Role)),
  authControllers.resetPassword
);
router.post(
  "/set-password",
  checkAuth(...Object.values(Role)),
  authControllers.setPassword
);

const authRoutes = router;

export default authRoutes;
