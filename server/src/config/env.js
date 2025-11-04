// import dotenv from "dotenv";
// dotenv.config();

// export const env = {
//   port: Number(process.env.PORT || 8080),
//   mongoUri: process.env.MONGO_URI,
//   clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
//   jwtSecret: process.env.JWT_SECRET,
//   isProd: process.env.NODE_ENV === "production",
// };
// export default {
//   smtpHost: process.env.SMTP_HOST,
//   smtpPort: process.env.SMTP_PORT,
//   smtpSecure: process.env.SMTP_SECURE,
//   smtpUser: process.env.SMTP_USER,
//   smtpPass: process.env.SMTP_PASS,
//   smtpFrom: process.env.SMTP_FROM,
//   isProd: process.env.NODE_ENV === "production",
// };

// server/src/config/env.js
import dotenv from "dotenv";
dotenv.config();

const bool = (v) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v.toLowerCase() === "true";
  return false;
};

export const env = {
  // בסיס
  port: Number(process.env.PORT || 8080),
  mongoUri: process.env.MONGO_URI,
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET,
  isProd: process.env.NODE_ENV === "production",

  // SMTP
  smtpHost: process.env.SMTP_HOST, // לדוגמה: smtp.gmail.com
  smtpPort: Number(process.env.SMTP_PORT) || 465, // 465 מומלץ עם Gmail
  smtpSecure: bool(process.env.SMTP_SECURE), // "true"/"false" -> boolean
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  smtpFrom: process.env.SMTP_FROM || process.env.SMTP_USER,
};

export default env;
