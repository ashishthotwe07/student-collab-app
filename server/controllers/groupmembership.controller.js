import Group from "../models/group.model.js";
import { validationResult } from "express-validator";

// Controller for managing group memberships
class GroupMembershipController {
  // @route    POST /api/groups/:groupId/join
  // @desc     Join a group (request for private groups, direct join for public groups)
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

      if (group.groupType === "private") {
        // Private group: Send a join request

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
      } else {
        // Public group: Directly add the student to members
        group.members.push(req.student.id);
        await group.save();
        res.status(200).json({ msg: "You have joined the group successfully" });
      }
    } catch (error) {
      console.error("Error joining group:", error.message);
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  }

  // @route    DELETE /api/groups/:groupId/requests/:requestId/cancel
  // @desc     Cancel a join request (Student, only for private groups)
  // @access   Private (Student)
  async cancelJoinRequest(req, res) {
    const { groupId, requestId } = req.params;

    try {
      const group = await Group.findById(groupId);

      if (!group) {
        return res.status(404).json({ msg: "Group not found" });
      }

      if (group.groupType !== "private") {
        return res
          .status(400)
          .json({ msg: "This action is only for private groups" });
      }

      // Find the join request
      const request = group.requests.find(
        (req) =>
          req._id.toString() === requestId &&
          req.student.toString() === req.student.id.toString()
      );

      if (!request) {
        return res
          .status(404)
          .json({ msg: "Join request not found or not yours" });
      }

      if (request.status !== "pending") {
        return res
          .status(400)
          .json({ msg: "Request has already been processed" });
      }

      // Remove the request
      group.requests = group.requests.filter(
        (req) => req._id.toString() !== requestId
      );

      await group.save();
      res.status(200).json({ msg: "Join request cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling join request:", error.message);
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  }

  // @route    POST /api/groups/:groupId/requests/:requestId/approve
  // @desc     Approve a join request (Admin only, private groups only)
  // @access   Private (Admin)
  async approveJoinRequest(req, res) {
    const { groupId, requestId } = req.params;

    try {
      const group = await Group.findById(groupId);

      if (!group) {
        return res.status(404).json({ msg: "Group not found" });
      }

      if (group.groupType !== "private") {
        return res
          .status(400)
          .json({ msg: "This action is only for private groups" });
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

  // @route    GET /api/groups/:groupId/members
  // @desc     Get a list of members in a specific group
  // @access   Private
  async viewGroupMembers(req, res) {
    const { groupId } = req.params;

    try {
      const group = await Group.findById(groupId).populate(
        "members",
        "name email"
      );

      if (!group) {
        return res.status(404).json({ msg: "Group not found" });
      }

      res.status(200).json({ members: group.members });
    } catch (error) {
      console.error("Error fetching group members:", error.message);
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  }

  // @route    DELETE /api/groups/:groupId/members/:memberId
  // @desc     Remove a member from the group (Admin only)
  // @access   Private (Admin)
  async removeGroupMember(req, res) {
    const { groupId, memberId } = req.params;

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

      // Check if the member is part of the group
      if (!group.members.includes(memberId)) {
        return res.status(404).json({ msg: "Member not found in this group" });
      }

      // Remove the member from the group
      group.members = group.members.filter(
        (member) => member.toString() !== memberId.toString()
      );

      await group.save();
      res.status(200).json({ msg: "Member removed successfully" });
    } catch (error) {
      console.error("Error removing member:", error.message);
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  }

  // @route    GET /api/groups/:groupId/requests
  // @desc     Get a list of pending join requests (Admin only)
  // @access   Private (Admin)
  async viewPendingRequests(req, res) {
    const { groupId } = req.params;

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

      // Filter pending requests
      const pendingRequests = group.requests.filter(
        (request) => request.status === "pending"
      );

      res.status(200).json({ pendingRequests });
    } catch (error) {
      console.error("Error fetching join requests:", error.message);
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  }

  // @route    PUT /api/groups/:groupId/members/:memberId/promote
  // @desc     Promote a member to admin (Admin only)
  // @access   Private (Admin only)
  async promoteMember(req, res) {
    const { groupId, memberId } = req.params;

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

      // Check if the member is already an admin
      if (group.admins.includes(memberId)) {
        return res.status(400).json({ msg: "This member is already an admin" });
      }

      // Add the member to the admins list
      group.admins.push(memberId);
      await group.save();

      res.status(200).json({ msg: "Member promoted to admin successfully" });
    } catch (error) {
      console.error("Error promoting member:", error.message);
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  }

  // @route    PUT /api/groups/:groupId/members/:memberId/demote
  // @desc     Demote an admin to a regular member (Only primary admin)
  // @access   Private (Admin only)
  async demoteMember(req, res) {
    const { groupId, memberId } = req.params;

    try {
      const group = await Group.findById(groupId);

      if (!group) {
        return res.status(404).json({ msg: "Group not found" });
      }

      // Check if the user is the primary admin
      const primaryAdminId = group.admins[0];
      if (req.student.id.toString() !== primaryAdminId.toString()) {
        return res
          .status(403)
          .json({ msg: "Access denied: You are not the primary admin" });
      }

      // Check if the member is an admin
      if (!group.admins.includes(memberId)) {
        return res.status(400).json({ msg: "This member is not an admin" });
      }

      // Remove the member from the admins list
      group.admins = group.admins.filter(
        (admin) => admin.toString() !== memberId
      );

      await group.save();
      res
        .status(200)
        .json({ msg: "Admin demoted to regular member successfully" });
    } catch (error) {
      console.error("Error demoting admin:", error.message);
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  }

  // @route    PUT /api/groups/:groupId/ownership
  // @desc     Transfer group ownership to another member (Admin only)
  // @access   Private (Admin only)
  async transferOwnership(req, res) {
    const { groupId } = req.params;
    const { newOwnerId } = req.body;

    try {
      const group = await Group.findById(groupId);

      if (!group) {
        return res.status(404).json({ msg: "Group not found" });
      }

      // Check if the user is the current owner
      if (group.owner.toString() !== req.student.id.toString()) {
        return res
          .status(403)
          .json({ msg: "Access denied: You are not the group owner" });
      }

      // Check if the new owner is a member of the group
      if (!group.members.includes(newOwnerId)) {
        return res
          .status(400)
          .json({ msg: "New owner must be a group member" });
      }

      // Transfer ownership
      group.owner = newOwnerId;

      await group.save();
      res.status(200).json({ msg: "Group ownership transferred successfully" });
    } catch (error) {
      console.error("Error transferring ownership:", error.message);
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  }

  // @route    PUT /api/groups/:groupId/members/self/demote
  // @desc     Demote yourself from admin to a regular member
  // @access   Private (Admin only)
  async demoteSelf(req, res) {
    const { groupId } = req.params;

    try {
      const group = await Group.findById(groupId);

      if (!group) {
        return res.status(404).json({ msg: "Group not found" });
      }

      // Check if the user is currently an admin
      if (!group.admins.includes(req.student.id)) {
        return res
          .status(403)
          .json({ msg: "Access denied: You are not an admin" });
      }

      // Check if the user is the only admin
      if (group.admins.length === 1) {
        return res.status(400).json({
          msg: "You cannot demote yourself because you are the only admin. Please transfer ownership or promote another member before demoting yourself.",
        });
      }

      // Remove the user from the admins list
      group.admins = group.admins.filter(
        (admin) => admin.toString() !== req.student.id.toString()
      );

      await group.save();

      res.status(200).json({
        msg: "You have successfully demoted yourself to a regular member.",
      });
    } catch (error) {
      console.error("Error demoting self:", error.message);
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  }
}

export default new GroupMembershipController();
