import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must contain at least 2 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must contain at least 6 characters"],
      select: false,
    },

    // image: {
    //   type: String,
    //   default: "",
    // },

    role: {
      type: String,
      enum: ["creator", "business", "admin"],
      default: null,
    },

    onboardingCompleted: {
      type: Boolean,
      default: false,
    },

    plan: {
      type: String,
      enum: ["free", "creator-pro", "business-pro", "agent"],
      default: null,
    },

    planSelected: {
      type: Boolean,
      default: false,
    },

    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;