import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "engineer", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      gestureSettings: {
        sensitivity: {
          type: Number,
          min: 0.1,
          max: 2.0,
          default: 1.0,
        },
        smoothing: {
          type: Boolean,
          default: true,
        },
        detectionConfidence: {
          type: Number,
          min: 0.1,
          max: 1.0,
          default: 0.5,
        },
        trackingConfidence: {
          type: Number,
          min: 0.1,
          max: 1.0,
          default: 0.5,
        },
      },
    },
    // Track user's robot access permissions
    robotAccess: [
      {
        robotId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Robot",
        },
        accessLevel: {
          type: String,
          enum: ["view", "control", "admin"],
          default: "view",
        },
        grantedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Track uploaded URDF files
    urdfFiles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "URDFFile",
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Index for faster queries (email index is created by unique: true)
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

export default mongoose.model("User", userSchema);
