import express from "express";
import studentController from "../controllers/student.controller.js";
import authMiddleware from "../middleware/auth.middleware.js"; 

const router = express.Router();

// Update student profile
router.put("/:id", authMiddleware, studentController.updateStudent);

export default router;
