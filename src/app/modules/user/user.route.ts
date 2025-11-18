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

router.get(
  "/all-users",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  userControllers.getAllUsers
);

router.get(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  userControllers.getSingleUser
);


const userRoutes = router;

export default userRoutes;
