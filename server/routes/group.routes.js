import express from "express";
import GroupController from "../controllers/group.controller.js";
import { check } from "express-validator"; // For validation
import authMiddleware from "../middleware/auth.middleware.js"; // Assuming you have an authentication middleware

const router = express.Router();

// Validation rules for group creation and updates
const groupValidationRules = [
  check("name").notEmpty().withMessage("Group name is required."),
  check("description").notEmpty().withMessage("Description is required."),
  check("groupType").notEmpty().withMessage("Group type is required."),
  check("settings")
    .optional()
    .isObject()
    .withMessage("Settings must be an object."),
];

// @route    POST /api/groups
// @desc     Create a new group
// @access   Private (Admin)
router.post(
  "/",
  authMiddleware,
  groupValidationRules,
  GroupController.createGroup
);

// @route    GET /api/groups/:id
// @desc     Get group details
// @access   Private
router.get("/:id", authMiddleware, GroupController.getGroupDetails);

// @route    GET /api/groups
// @desc     Get all groups
// @access   Private
router.get("/", authMiddleware, GroupController.getAllGroups);

// @route    PUT /api/groups/:id
// @desc     Update group information
// @access   Private (Admin)
router.put(
  "/:id",
  authMiddleware,
  groupValidationRules,
  GroupController.updateGroup
);

// @route    DELETE /api/groups/:id
// @desc     Delete a group
// @access   Private (Admin)
router.delete("/:id", authMiddleware, GroupController.deleteGroup);



export default router;
