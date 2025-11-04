import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import { verifyMailTransport } from "./utils/mail.js";

const app = express();

// Middleewares
// app.use(cors());
app.use(
  cors({
    origin: "http://localhost:5173", // <- זה המקור של הצד לקוח ב -vite.
    credentials: true, // נדרש כדי לאפשר cookies (Remember Me)
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes);

verifyMailTransport(() => {});
// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(env.mongoUri);
    console.log("✅ MongoDB Connected :)");
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
  }
}
connectDB();

// Test Route
app.use("/api/auth", authRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "Server is running ✅" });
});

// Start Server
app.listen(env.port, () => {
  console.log(`🚀 Server is running on http://localhost:${env.port}`);
});
