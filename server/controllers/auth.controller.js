import Student from "../models/student.model.js";
import bcrypt from "bcryptjs"; // For password hashing
import jwt from "jsonwebtoken"; // For generating JWT tokens
import { validationResult } from "express-validator"; // For validating requests

class AuthController {
  // @route    POST /api/auth/signup
  // @desc     Register a new student
  // @access   Public
  async register(req, res) {
    const { firstName, lastName, email, password, department } = req.body;

    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if student exists by email
      let student = await Student.findOne({ email });
      if (student) {
        return res.status(400).json({ msg: "Student already exists" });
      }

      // Create new student object
      student = new Student({
        firstName,
        lastName,
        email,
        password,
        department, // Must be provided
      });

      // Hash the password before saving
      const salt = await bcrypt.genSalt(10);
      student.password = await bcrypt.hash(password, salt);

      // Save the student
      await student.save();

      // Generate JWT token
      const payload = { student: { id: student.id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      // Set cookie with the JWT token
      res.cookie("token", token, {
        httpOnly: true, // Prevents JavaScript access to the cookie
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        expires: new Date(Date.now() + 3600000), // 1 hour expiry
      });

      res.status(201).json({ msg: "Student registered successfully" });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  }

  // @route    POST /api/auth/login
  // @desc     Authenticate student and get token
  // @access   Public
  async login(req, res) {
    const { email, password } = req.body;

    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if student exists by email
      let student = await Student.findOne({ email });
      if (!student) {
        return res.status(400).json({ msg: "Invalid Credentials" });
      }

      // Check if password matches
      const isMatch = await bcrypt.compare(password, student.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid Credentials" });
      }

      // Generate JWT token
      const payload = { student: { id: student.id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      // Set cookie with the JWT token
      res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 3600000), // 1 hour expiry
      });

      res.status(200).json({ msg: "Login successful" });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  }

  // @route    POST /api/auth/logout
  // @desc     Logout student
  // @access   Private
  async logout(req, res) {
    try {
      // Clear the cookie
      res.clearCookie("token");
      res.status(200).json({ msg: "Logged out successfully" });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  }

  // @route    GET /api/auth/student
  // @desc     Get student details (protected route)
  // @access   Private
  async getStudentDetails(req, res) {
    try {
      // Get the student ID from the JWT payload
      const student = await Student.findById(req.student.id).select(
        "-password"
      );
      if (!student) {
        return res.status(404).json({ msg: "Student not found" });
      }

      res.status(200).json(student);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  }
}

export default new AuthController();
