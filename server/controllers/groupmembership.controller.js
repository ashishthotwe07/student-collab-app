import Group from "../models/group.model.js";
import { validationResult } from "express-validator";

// Controller for managing group memberships
class GroupMembershipController {
  // @route    POST /api/groups/:groupId/join
  // @desc     Send a request to join a group
  // @access   Private
  async joinGroup(req, res) {
    const { groupId } = req.params;

    try {
      const group = await Group.findById(groupId);

      if (!group) {
        return res.status(404).json({ msg: "Group not found" });
      }

      // Check if the student is already a member
      if (group.members.includes(req.student.id)) {
        return res
          .status(400)
          .json({ msg: "You are already a member of this group" });
      }

      // Check if the student already has a pending request
      const existingRequest = group.requests.find(
        (request) => request.student.toString() === req.student.id.toString()
      );
      if (existingRequest) {
        return res.status(400).json({ msg: "Join request already sent" });
      }

      // Add the join request to the group
      group.requests.push({
        student: req.student.id,
        status: "pending",
        requestedAt: Date.now(),
      });

      await group.save();
      res.status(200).json({ msg: "Join request sent successfully" });
    } catch (error) {
      console.error("Error sending join request:", error.message);
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  }

  // @route    POST /api/groups/:groupId/requests/:requestId/approve
  // @desc     Approve a join request (Admin only)
  // @access   Private (Admin)
  async approveJoinRequest(req, res) {
    const { groupId, requestId } = req.params;

    try {
      const group = await Group.findById(groupId);

      if (!group) {
        return res.status(404).json({ msg: "Group not found" });
      }

      // Check if the user is an admin
      if (!group.admins.includes(req.student.id)) {
        return res
          .status(403)
          .json({ msg: "Access denied: You are not an admin" });
      }

      // Find the join request
      const request = group.requests.find(
        (req) => req._id.toString() === requestId
      );

      if (!request) {
        return res.status(404).json({ msg: "Join request not found" });
      }

      if (request.status !== "pending") {
        return res
          .status(400)
          .json({ msg: "This request has already been processed" });
      }

      // Approve the request
      request.status = "accepted";
      group.members.push(request.student); // Add the student to the members list

      await group.save();
      res.status(200).json({ msg: "Join request approved successfully" });
    } catch (error) {
      console.error("Error approving join request:", error.message);
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  }

  // @route    POST /api/groups/:groupId/requests/:requestId/reject
  // @desc     Reject a join request (Admin only)
  // @access   Private (Admin)
  async rejectJoinRequest(req, res) {
    const { groupId, requestId } = req.params;

    try {
      const group = await Group.findById(groupId);

      if (!group) {
        return res.status(404).json({ msg: "Group not found" });
      }

      // Check if the user is an admin
      if (!group.admins.includes(req.student.id)) {
        return res
          .status(403)
          .json({ msg: "Access denied: You are not an admin" });
      }

      // Find the join request
      const request = group.requests.find(
        (req) => req._id.toString() === requestId
      );

      if (!request) {
        return res.status(404).json({ msg: "Join request not found" });
      }

      if (request.status !== "pending") {
        return res
          .status(400)
          .json({ msg: "This request has already been processed" });
      }

      // Reject the request
      request.status = "rejected";

      await group.save();
      res.status(200).json({ msg: "Join request rejected successfully" });
    } catch (error) {
      console.error("Error rejecting join request:", error.message);
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  }

  // @route    POST /api/groups/:groupId/leave
  // @desc     Leave a group
  // @access   Private
  async leaveGroup(req, res) {
    const { groupId } = req.params;

    try {
      const group = await Group.findById(groupId);

      if (!group) {
        return res.status(404).json({ msg: "Group not found" });
      }

      // Check if the student is a member
      if (!group.members.includes(req.student.id)) {
        return res
          .status(400)
          .json({ msg: "You are not a member of this group" });
      }

      // Remove the student from the members list
      group.members = group.members.filter(
        (member) => member.toString() !== req.student.id.toString()
      );

      await group.save();
      res.status(200).json({ msg: "You have left the group successfully" });
    } catch (error) {
      console.error("Error leaving group:", error.message);
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  }
}

export default new GroupMembershipController();
