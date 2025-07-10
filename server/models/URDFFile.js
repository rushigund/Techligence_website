import mongoose from "mongoose";

const urdfFileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    checksum: {
      type: String,
      required: true,
    },
    robotType: {
      type: String,
      enum: ["4wd", "humanoid", "arm", "drone", "custom"],
      required: true,
    },
    category: {
      type: String,
      enum: [
        "exploration",
        "industrial",
        "surveillance",
        "research",
        "education",
        "sample",
      ],
      required: true,
    },
    // Parsed URDF structure
    structure: {
      robotName: String,
      links: [
        {
          name: String,
          visual: {
            geometry: {
              type: {
                type: String,
                enum: ["box", "cylinder", "sphere", "mesh"],
              },
              dimensions: mongoose.Schema.Types.Mixed,
            },
            material: {
              name: String,
              color: {
                r: Number,
                g: Number,
                b: Number,
                a: Number,
              },
            },
            origin: {
              xyz: [Number],
              rpy: [Number],
            },
          },
          collision: mongoose.Schema.Types.Mixed,
          inertial: mongoose.Schema.Types.Mixed,
        },
      ],
      joints: [
        {
          name: String,
          type: {
            type: String,
            enum: [
              "revolute",
              "continuous",
              "prismatic",
              "fixed",
              "floating",
              "planar",
            ],
          },
          parent: String,
          child: String,
          origin: {
            xyz: [Number],
            rpy: [Number],
          },
          axis: {
            xyz: [Number],
          },
          limit: {
            lower: Number,
            upper: Number,
            effort: Number,
            velocity: Number,
          },
        },
      ],
      materials: [
        {
          name: String,
          color: {
            rgba: [Number],
          },
          texture: {
            filename: String,
          },
        },
      ],
    },
    // Validation results
    validation: {
      isValid: {
        type: Boolean,
        required: true,
      },
      errors: [String],
      warnings: [String],
      linkCount: Number,
      jointCount: Number,
      materialCount: Number,
    },
    // Usage tracking
    usage: {
      downloadCount: {
        type: Number,
        default: 0,
      },
      lastUsed: Date,
      popularityScore: {
        type: Number,
        default: 0,
      },
    },
    // Sharing and permissions
    visibility: {
      type: String,
      enum: ["private", "public", "shared"],
      default: "private",
    },
    sharedWith: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        permission: {
          type: String,
          enum: ["view", "edit"],
          default: "view",
        },
        sharedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    // Associated robots using this URDF
    associatedRobots: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Robot",
      },
    ],
    // Version control
    version: {
      type: String,
      default: "1.0.0",
    },
    parentFile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "URDFFile",
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Virtual for file URL
urdfFileSchema.virtual("fileUrl").get(function () {
  return `${process.env.SERVER_URL || "http://localhost:5000"}/uploads/${
    this.filePath
  }`;
});

// Method to increment download count
urdfFileSchema.methods.incrementDownload = function () {
  this.usage.downloadCount += 1;
  this.usage.lastUsed = new Date();
  this.usage.popularityScore = this.calculatePopularity();
  return this.save();
};

// Method to calculate popularity score
urdfFileSchema.methods.calculatePopularity = function () {
  const downloads = this.usage.downloadCount;
  const age = (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24); // days
  const recentUsage = this.usage.lastUsed
    ? (Date.now() - this.usage.lastUsed.getTime()) / (1000 * 60 * 60 * 24)
    : age;

  // Simple popularity algorithm
  return Math.max(0, downloads * 10 - age * 0.1 - recentUsage * 0.5);
};

// Method to check if user has access
urdfFileSchema.methods.hasAccess = function (userId) {
  if (this.visibility === "public") return true;
  if (this.owner.toString() === userId.toString()) return true;
  if (this.visibility === "shared") {
    return this.sharedWith.some(
      (share) => share.userId.toString() === userId.toString(),
    );
  }
  return false;
};

// Indexes for efficient queries
urdfFileSchema.index({ owner: 1 });
urdfFileSchema.index({ robotType: 1, category: 1 });
urdfFileSchema.index({ visibility: 1 });
urdfFileSchema.index({ tags: 1 });
urdfFileSchema.index({ "usage.popularityScore": -1 });
urdfFileSchema.index({ createdAt: -1 });
urdfFileSchema.index({ checksum: 1 });

export default mongoose.model("URDFFile", urdfFileSchema);
