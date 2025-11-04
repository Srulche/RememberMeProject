// import jwt from "jsonwebtoken";
// import { env } from "../config/env.js";

// export function signUserToken(user) {
//   // user: { _id, email }
//   return jwt.sign(
//     { uid: user._id.toString(), email: user.email },
//     env.jwtSecret,
//     { expiresIn: "7d" } // לא משנה אם ה-cookie session; זה עבור remember
//   );
// }
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signUserToken(payload, remember = false) {
  if (!env.jwtSecret)
    throw new Error("JWT secret is not defined in environment variables");
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: remember ? "30d" : "2h",
  });
}
export function issueJwt(res, uid, remember = false, email) {
  const token = signUserToken({ uid, email }, remember);
  const cookieOptions = {
    httpOnly: true,
    sameSite: env.isProd ? "none" : "lax",
    secure: env.isProd,
    ...(remember ? { maxAge: 7 * 24 * 60 * 60 * 1000 } : {}),
  };
  res.cookie("jwt", token, cookieOptions);
  return token;
}
// // user: { _id, email }
// return jwt.sign(
//   { uid: user._id.toString(), email: user.email, remember: !!remember },
//   env.jwtSecret,
//   { expiresIn: remember ? "7d" : "2h" } // אופציונלי; רק ל-JWT
// );
