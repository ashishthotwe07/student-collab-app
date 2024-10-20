import mongoose from "mongoose";
import crypto from "crypto";

const { Schema } = mongoose;

const groupSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  admins: [
    {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
  ],
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
  ],
  requests: [
    {
      student: {
        type: Schema.Types.ObjectId,
        ref: "Student",
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
      },
      requestedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  resources: [
    {
      fileUrl: {
        type: String,
        trim: true,
      },
      uploadedBy: {
        type: Schema.Types.ObjectId,
        ref: "Student",
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  chats: [
    {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  ],
  announcements: [
    {
      content: {
        type: String,
        trim: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: "Student",
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  groupType: {
    type: String,
    enum: ["public", "private"], // Only allows 'public' or 'private'
    default: "public", // Default to public
  },
  inviteCode: {
    type: String,
    unique: true,
    required: true,
    default: () => crypto.randomBytes(4).toString("hex"),
  },
  settings: {
    allowFileSharing: {
      type: Boolean,
      default: true,
    },
    allowChat: {
      type: Boolean,
      default: true,
    },
  },
});

// Compile the model from the schema
const Group = mongoose.model("Group", groupSchema);

export default Group;
