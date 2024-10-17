import express from "express";
import GroupMembershipController from "../controllers/groupmembership.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Route for joining a group
router.post(
  "/:groupId/join",
  authMiddleware,
  GroupMembershipController.joinGroup
);

// Route for approving a join request (Admin)
router.post(
  "/:groupId/requests/:requestId/approve",
  authMiddleware,
  GroupMembershipController.approveJoinRequest
);

// Route for rejecting a join request (Admin)
router.post(
  "/:groupId/requests/:requestId/reject",
  authMiddleware,
  GroupMembershipController.rejectJoinRequest
);

// Route for leaving a group
router.post(
  "/:groupId/leave",
  authMiddleware,
  GroupMembershipController.leaveGroup
);

export default router;
