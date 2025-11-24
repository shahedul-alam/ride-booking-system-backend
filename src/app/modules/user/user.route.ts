import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest.middleware";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import userControllers from "./user.controller";
import { checkAuth } from "../../middlewares/checkAuth.middleware";
import { Role } from "./user.interface";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  userControllers.createUser
);

router.patch(
  "/:id",
  checkAuth(...Object.values(Role)),
  validateRequest(updateUserZodSchema),
  userControllers.updateUser
);

router.get("/me", checkAuth(...Object.values(Role)), userControllers.getMe);

const userRoutes = router;

export default userRoutes;
