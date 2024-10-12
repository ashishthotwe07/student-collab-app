import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import cookieParser from "cookie-parser"; // Import cookie-parser
import studentRouter from "./routes/student.routes.js";

dotenv.config();

const app = express();
// Middleware
app.use(express.json()); // For parsing application/json
app.use(cookieParser()); // Use cookie-parser middleware

// MongoDB connection
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
