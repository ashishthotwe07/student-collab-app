import express from "express";
import authController from "../controllers/auth.controller.js";
import verifyToken from "../middleware/auth.middleware.js"; // Token verification middleware

const router = express.Router();

// @route    POST /api/auth/signup
// @desc     Register a new student
// @access   Public
router.post("/signup", authController.register);

// @route    POST /api/auth/login
// @desc     Authenticate student and get token
// @access   Public
router.post("/login", authController.login);

// @route    POST /api/auth/logout
// @desc     Logout student
// @access   Private
router.post("/logout", verifyToken, authController.logout);

// @route    GET /api/auth/student
// @desc     Get student details (protected route)
// @access   Private
router.get("/student", verifyToken, authController.getStudentDetails);

export default router;
