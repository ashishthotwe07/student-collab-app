import mongoose from "mongoose";
const { Schema } = mongoose;

const studentSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default:
        "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg",
    },
    department: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
    },
    interests: [String],
    socialLinks: [
      {
        platform: { type: String }, // e.g., "GitHub"
        url: { type: String }, // e.g., "https://github.com/username"
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);
