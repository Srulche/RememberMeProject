import { Router } from "express";
import { login, me, logout } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  startSignup,
  verifyOtp,
  resendOtp,
} from "../controllers/auth.controller.js";
const router = Router();

router.post("/login", login);
router.get("/me", requireAuth, me);
router.post("/logout", requireAuth, logout);
// router.post("/signup/start", startSignup);
router.post("/start-signup", startSignup);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
export default router;
