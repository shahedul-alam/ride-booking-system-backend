import { Router } from "express";
import { authControllers } from "./auth.controller";

const router = Router();

router.post("/login", authControllers.credentialsLogin);

const authRoutes = router;

export default authRoutes;
