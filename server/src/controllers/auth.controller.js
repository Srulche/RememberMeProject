import bcrypt from "bcrypt";
import User from "../models/User.js";
import pendingSignup from "../models/pendingSignup.js";
import { env } from "../config/env.js";
import { sendOtpEmail } from "../utils/mail.js";
import { issueJwt } from "../utils/tokens.js";

// --------- Helpers ----------
function isValidEmail(s) {
  return typeof s === "string" && s.includes("@") && s.includes(".");
}
function bad(res, code, message) {
  return res.status(code).json({ ok: false, message });
}

export async function login(req, res) {
  try {
    const { email, password, remember } = req.body ?? {};
    console.log("[LOGIN] ->", { email, remember });

    if (!email || !password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // מנרמלים אימייל (למנוע case-sensitivity)
    const normEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normEmail }); // ודא שגם ה-seed נשמר lowercase

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // תמיכה גם ב-password וגם ב-passwordHash
    const hash = user.password || user.passwordHash;
    if (!hash) {
      console.error("[LOGIN] missing password hash on user", {
        id: user._id,
        email: user.email,
      });
      return res.status(500).json({ message: "User password is not set" });
    }

    const ok = await bcrypt.compare(String(password), String(hash));
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // הנפקת JWT
    // await issueJwt(res, user._id.toString(), !!remember);
    issueJwt(res, user._id.toString(), !!remember, user.email);
    return res.json({
      ok: true,
      uid: user._id.toString(),
      email: user.email,
      remember: !!remember,
    });
  } catch (err) {
    console.error("[LOGIN] error:", err); // חשוב לראות את ה-stack
    return res.status(500).json({ message: "Server error" });
  }
}

export async function me(req, res) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  return res.json({ uid: req.user.uid, email: req.user.email });
}

export async function logout(req, res) {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? "none" : "lax",
  });
  return res.json({ ok: true });
}

// --------- START SIGNUP (send OTP) ----------
export async function startSignup(req, res) {
  try {
    const { email, password } = req.body;

    if (
      !isValidEmail(email) ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return bad(res, 400, "Invalid email or password");
    }
    // אם כבר יש יוזר אמיתי – לא מתחילים הרשמה
    const existing = await User.findOne({ email }).lean();
    if (existing)
      return res.status(409).json({ message: "User already exists" });

    // יצירת OTP, hashing סיסמה, ותוקף
    const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6 ספרות
    const passwordHash = await bcrypt.hash(password, 10);
    const expires = new Date(Date.now() + 10 * 60 * 1000); // תוקף 10 דק'

    // upsert במסד (נדרוס ניסיון קודם)
    await pendingSignup.findOneAndUpdate(
      { email },
      { email, passwordHash, otp, otpExpiresAt: expires },
      { upsert: true, new: true }
    );

    // שליחת OTP — אם נכשל, אל תמשיך
    let sent = false;
    try {
      await sendOtpEmail(email, otp);
      sent = true;
      console.log(`[OTP] to ${email}: ${otp} (valid 10m)`);
    } catch (e) {
      console.error("[MAIL] send failed:", e?.message);
    }
    if (!sent) {
      return res.status(500).json({
        ok: false,
        code: "OTP_SEND_FAILED",
        message: "Failed to send OTP",
      });
    }

    return res.json({ ok: true, nextAction: "otp_required" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /auth/verify-otp
export async function verifyOtp(req, res) {
  try {
    console.log("[VERIFY OTP] body:", req.body);
    const { email, otp } = req.body ?? {};
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const rec = await pendingSignup.findOne({ email });
    if (!rec) {
      return res
        .status(400)
        .json({ message: "No pending signup for this email" });
    }

    // בדיקת תוקף וקוד
    const now = new Date();
    if (rec.otp !== String(otp).trim()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (rec.otpExpiresAt && rec.otpExpiresAt < now) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // אם יש כבר משתמש – לנקות pending ולהחזיר קונפליקט או פשוט לחבר אותו
    const existing = await User.findOne({ email });
    if (existing) {
      await pendingSignup.deleteOne({ email });
      issueJwt(res, existing._id.toString(), false);
      return res.json({
        ok: true,
        uid: existing._id.toString(),
        email: existing.email,
      });
      // לחלופין: return res.status(409).json({ message: "User already exists" });
    }

    // יצירת המשתמש מה־passwordHash ששמרנו בשלב start-signup
    const user = await User.create({
      email,
      password: rec.passwordHash, // כבר מוצפן
    });

    // ניקוי הרשומה הזמנית
    await pendingSignup.deleteOne({ email });

    // הנפקת JWT והחזרה ללקוח
    issueJwt(res, user._id.toString(), false);
    return res.json({ ok: true, uid: user._id.toString(), email: user.email });
  } catch (err) {
    console.error("[VERIFY OTP] error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /auth/resend-otp
export async function resendOtp(req, res) {
  try {
    const { email } = req.body ?? {};
    if (!email) return res.status(400).json({ message: "Email is required" });

    const rec = await pendingSignup.findOne({ email });
    if (!rec)
      return res
        .status(400)
        .json({ message: "No pending signup for this email" });

    const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6 ספרות
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    rec.otp = otp;
    rec.otpExpiresAt = expires;
    await rec.save();

    try {
      await sendOtpEmail(email, otp);
    } catch (e) {
      console.error("[MAIL] send failed (resend):", e?.message);
      // לא מפילים את הבקשה – אפשר להחליט אחרת לפי הצורך
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("[RESEND OTP] error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
