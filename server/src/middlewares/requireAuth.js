import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.jwt;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = { uid: decoded.uid, email: decoded.email };
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // try {
  //   const payload = jwt.verify(token, env.jwtSecret);
  //   // payload: { uid, email, iat, exp }
  //   req.user = {
  //     uid: payload.uid,
  //     email: payload.email,
  //     remember: payload.remember,
  //   };
  //   next();
  // } catch {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }
}
