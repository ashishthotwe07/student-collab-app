import Group from "../models/group.model.js";
import { validationResult } from "express-validator";

class GroupController {
  // @route    POST /api/groups
  // @desc     Create a new group
  // @access   Private (Admin)
  async createGroup(req, res) {
    const { name, description, groupType, settings } = req.body;

    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newGroup = new Group({
        name,
        description,
        groupType,
        settings,
        admins: [req.student.id], // Automatically set the creator as an admin
      });

      await newGroup.save();
      res
        .status(201)
        .json({ msg: "Group created successfully", group: newGroup });
    } catch (error) {
      console.error("Error creating group:", error.message);
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  }

  // @route    GET /api/groups/:id
  // @desc     Get group details
  // @access   Private
  async getGroupDetails(req, res) {
    const { id } = req.params;

    try {
      const group = await Group.findById(id)
        .populate("admins", "firstName lastName email")
        .populate("members", "firstName lastName email")
        .populate("resources");

      if (!group) {
        return res.status(404).json({ msg: "Group not found" });
      }

      res.status(200).json(group);
    } catch (error) {
      console.error("Error fetching group details:", error.message);
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  }

  // @route    PUT /api/groups/:id
  // @desc     Update group information
  // @access   Private (Admin)
  async updateGroup(req, res) {
    const { id } = req.params;
    const { name, description, groupType, settings } = req.body;

    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const group = await Group.findById(id);
      if (!group) {
        return res.status(404).json({ msg: "Group not found" });
      }

      // Check if the logged-in user is an admin of the group
      if (!group.admins.includes(req.student.id)) {
        return res
          .status(403)
          .json({ msg: "Access denied: You are not an admin" });
      }

      // Update group fields
      group.name = name || group.name;
      group.description = description || group.description;
      group.groupType = groupType || group.groupType;
      group.settings = settings || group.settings;

      await group.save();
      res.status(200).json({ msg: "Group updated successfully", group });
    } catch (error) {
      console.error("Error updating group:", error.message);
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  }

  // @route    DELETE /api/groups/:id
  // @desc     Delete a group
  // @access   Private (Admin)
  async deleteGroup(req, res) {
    const { id } = req.params;

    try {
      const group = await Group.findById(id);
      if (!group) {
        return res.status(404).json({ msg: "Group not found" });
      }

      // Check if the logged-in user is an admin of the group
      if (!group.admins.includes(req.student.id)) {
        return res
          .status(403)
          .json({ msg: "Access denied: You are not an admin" });
      }

      await group.remove();
      res.status(200).json({ msg: "Group deleted successfully" });
    } catch (error) {
      console.error("Error deleting group:", error.message);
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  }

  // @route    POST /api/groups/:id/invite
  // @desc     Regenerate invite code for the group
  // @access   Private (Admin)
  async regenerateInviteCode(req, res) {
    const { id } = req.params;

    try {
      const group = await Group.findById(id);
      if (!group) {
        return res.status(404).json({ msg: "Group not found" });
      }

      // Check if the logged-in user is an admin of the group
      if (!group.admins.includes(req.student.id)) {
        return res
          .status(403)
          .json({ msg: "Access denied: You are not an admin" });
      }

      // Generate a new invite code
      group.inviteCode = this.generateInviteCode();
      await group.save();

      res.status(200).json({
        msg: "Invite code regenerated successfully",
        inviteCode: group.inviteCode,
      });
    } catch (error) {
      console.error("Error regenerating invite code:", error.message);
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  }

  // Generate a random invite code
  generateInviteCode() {
    return crypto.randomBytes(4).toString("hex"); // Generate a unique 8-character invite code
  }

  // @route    GET /api/groups
  // @desc     Get all groups
  // @access   Private
  async getAllGroups(req, res) {
    try {
      const groups = await Group.find({})
        .populate("admins", "firstName lastName email")
        .populate("members", "firstName lastName email");

      if (!groups || groups.length === 0) {
        return res.status(404).json({ msg: "No groups found" });
      }

      res.status(200).json(groups);
    } catch (error) {
      console.error("Error fetching all groups:", error.message);
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  }
}

export default new GroupController();
