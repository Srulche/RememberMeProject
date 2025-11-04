import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const secure = env.smtpSecure === true || String(env.smtpSecure).toLowerCase();
const port = Number(env.smtpPort) || (secure ? 465 : 587);

export const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port,
  secure,
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass,
  },
});

transporter.on("error", (err) => {
  console.error("[MAIL] Transporter error:", err?.message);
});

export async function verifyMailTransport() {
  try {
    await transporter.verify();
    console.log("[MAIL] transporter ready");
  } catch (e) {
    console.error("[MAIL] verify failed:", e?.message);
  }
}

export async function sendOtpEmail(to, otp) {
  const info = await transporter.sendMail({
    from: env.smtpFrom || env.smtpUser,
    to,
    subject: "Your OTP code",
    text: `Your verification code is: ${otp}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>Verification code</h2>
        <p>Your OTP is:</p>
        <div style="font-size:28px;font-weight:700;letter-spacing:3px">${otp}</div>
        <p style="color:#666">The code expires in 5 minutes.</p>
      </div>
    `,
  });

  console.log(`[MAIL] Sent OTP to ${to}. messageId=${info.messageId}`);
  return true;
}
