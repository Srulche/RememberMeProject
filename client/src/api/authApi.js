import { http } from "./http.js";

export function loginApi({ email, password, remember }) {
  return http.post("/auth/login", { email, password, remember });
}

export function meApi() {
  return http.get("/auth/me");
}

export function logoutApi() {
  return http.post("/auth/logout");
}

export function startSignupApi({ email, password }) {
  return http.post("/auth/start-signup", { email, password });
}
export function verifyOtpApi({ email, otp }) {
  return http.post("/auth/verify-otp", { email, otp });
}

export function resendOtpApi({ email }) {
  return http.post("/auth/resend-otp", { email });
}
