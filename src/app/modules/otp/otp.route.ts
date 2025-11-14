import express from "express";
import OTPController from "./otp.controller";

const router = express.Router();

router.post("/send", OTPController.sendUserVerificationOTP);
router.post("/verify", OTPController.verifyUserVerificationOTP);

const OtpRoutes = router;

export default OtpRoutes;
