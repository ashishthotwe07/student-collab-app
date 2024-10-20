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

// Route for canceling a join request
router.delete(
  "/:groupId/requests/:requestId/cancel",
  authMiddleware,
  GroupMembershipController.cancelJoinRequest
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

// Route for viewing group members
router.get(
  "/:groupId/members",
  authMiddleware,
  GroupMembershipController.viewGroupMembers
);

// Route for viewing pending join requests (Admin)
router.get(
  "/:groupId/requests",
  authMiddleware,
  GroupMembershipController.viewPendingRequests
);

// Route for removing a member from the group (Admin)
router.delete(
  "/:groupId/members/:memberId",
  authMiddleware,
  GroupMembershipController.removeGroupMember
);

// Route for promoting a member to admin (Admin)
router.put(
  "/:groupId/members/:memberId/promote",
  authMiddleware,
  GroupMembershipController.promoteMember
);

// Route for demoting a member from admin to regular member (Admin only)
router.put(
  "/:groupId/members/:memberId/demote",
  authMiddleware,
  GroupMembershipController.demoteMember
);

// Route for transferring group ownership to another member (Admin only)
router.put(
  "/:groupId/ownership",
  authMiddleware,
  GroupMembershipController.transferOwnership
);

// Route for demoting yourself from admin to a regular member
router.put(
  "/:groupId/members/self/demote",
  authMiddleware,
  GroupMembershipController.demoteSelf
);

export default router;
