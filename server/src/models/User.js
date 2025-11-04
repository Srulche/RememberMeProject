import mongoose from "mongoose";
// import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// userSchema.methods.comparePassword = function (plain) {
//   return bcrypt.compare(plain, this.passwordHash);
// };

const User = mongoose.model("User", userSchema);
export default User;
