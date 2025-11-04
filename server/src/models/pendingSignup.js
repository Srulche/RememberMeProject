import mongoose from "mongoose";

const PendingSignupSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, index: true },
    passwordHash: String,
    otp: String,
    otpExpiresAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("PendingSignup", PendingSignupSchema);
