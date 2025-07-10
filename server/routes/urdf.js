import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { body, query, validationResult } from "express-validator";
import xml2js from "xml2js";
import URDFFile from "../models/URDFFile.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Multer configuration for URDF file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = "uploads/urdf";
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `urdf-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ["application/xml", "text/xml", "text/plain"];
  const allowedExts = [".urdf", ".xml"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only URDF and XML files are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Parse URDF file content
const parseURDFContent = async (content) => {
  try {
    const parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
      trim: true,
    });

    const parsed = await parser.parseStringPromise(content);

    if (!parsed.robot) {
      throw new Error("Invalid URDF: No robot element found");
    }

    const robot = parsed.robot;
    const structure = {
      robotName: robot.name || "unnamed_robot",
      links: [],
      joints: [],
      materials: [],
    };

    // Parse links
    if (robot.link) {
      const links = Array.isArray(robot.link) ? robot.link : [robot.link];
      structure.links = links.map((link) => ({
        name: link.name,
        visual: link.visual
          ? {
              geometry: parseGeometry(link.visual.geometry),
              material: parseMaterial(link.visual.material),
              origin: parseOrigin(link.visual.origin),
            }
          : null,
        collision: link.collision || null,
        inertial: link.inertial || null,
      }));
    }

    // Parse joints
    if (robot.joint) {
      const joints = Array.isArray(robot.joint) ? robot.joint : [robot.joint];
      structure.joints = joints.map((joint) => ({
        name: joint.name,
        type: joint.type,
        parent: joint.parent?.link,
        child: joint.child?.link,
        origin: parseOrigin(joint.origin),
        axis: joint.axis
          ? {
              xyz: joint.axis.xyz
                ? joint.axis.xyz.split(" ").map(Number)
                : [0, 0, 1],
            }
          : null,
        limit: joint.limit
          ? {
              lower: parseFloat(joint.limit.lower) || 0,
              upper: parseFloat(joint.limit.upper) || 0,
              effort: parseFloat(joint.limit.effort) || 0,
              velocity: parseFloat(joint.limit.velocity) || 0,
            }
          : null,
      }));
    }

    // Parse materials
    if (robot.material) {
      const materials = Array.isArray(robot.material)
        ? robot.material
        : [robot.material];
      structure.materials = materials.map((material) => ({
        name: material.name,
        color: material.color
          ? {
              rgba: material.color.rgba
                ? material.color.rgba.split(" ").map(Number)
                : [1, 1, 1, 1],
            }
          : null,
        texture: material.texture
          ? { filename: material.texture.filename }
          : null,
      }));
    }

    return structure;
  } catch (error) {
    throw new Error(`URDF parsing failed: ${error.message}`);
  }
};

// Helper functions for parsing URDF elements
const parseGeometry = (geometry) => {
  if (!geometry) return null;

  if (geometry.box) {
    return {
      type: "box",
      dimensions: {
        size: geometry.box.size
          ? geometry.box.size.split(" ").map(Number)
          : [1, 1, 1],
      },
    };
  }

  if (geometry.cylinder) {
    return {
      type: "cylinder",
      dimensions: {
        radius: parseFloat(geometry.cylinder.radius) || 1,
        length: parseFloat(geometry.cylinder.length) || 1,
      },
    };
  }

  if (geometry.sphere) {
    return {
      type: "sphere",
      dimensions: {
        radius: parseFloat(geometry.sphere.radius) || 1,
      },
    };
  }

  if (geometry.mesh) {
    return {
      type: "mesh",
      dimensions: {
        filename: geometry.mesh.filename,
        scale: geometry.mesh.scale
          ? geometry.mesh.scale.split(" ").map(Number)
          : [1, 1, 1],
      },
    };
  }

  return null;
};

const parseMaterial = (material) => {
  if (!material) return null;

  return {
    name: material.name,
    color: material.color
      ? {
          r: parseFloat(material.color.rgba?.split(" ")[0]) || 1,
          g: parseFloat(material.color.rgba?.split(" ")[1]) || 1,
          b: parseFloat(material.color.rgba?.split(" ")[2]) || 1,
          a: parseFloat(material.color.rgba?.split(" ")[3]) || 1,
        }
      : null,
  };
};

const parseOrigin = (origin) => {
  if (!origin) return { xyz: [0, 0, 0], rpy: [0, 0, 0] };

  return {
    xyz: origin.xyz ? origin.xyz.split(" ").map(Number) : [0, 0, 0],
    rpy: origin.rpy ? origin.rpy.split(" ").map(Number) : [0, 0, 0],
  };
};

// Validate URDF content
const validateURDF = (structure) => {
  const errors = [];
  const warnings = [];

  // Check for required elements
  if (!structure.robotName) {
    errors.push("Robot name is required");
  }

  if (structure.links.length === 0) {
    errors.push("At least one link is required");
  }

  // Check for orphaned joints
  const linkNames = structure.links.map((link) => link.name);
  structure.joints.forEach((joint) => {
    if (joint.parent && !linkNames.includes(joint.parent)) {
      warnings.push(
        `Joint "${joint.name}" references unknown parent link "${joint.parent}"`,
      );
    }
    if (joint.child && !linkNames.includes(joint.child)) {
      warnings.push(
        `Joint "${joint.name}" references unknown child link "${joint.child}"`,
      );
    }
  });

  // Check for circular dependencies
  const checkCircularDependency = (jointName, visited = new Set()) => {
    if (visited.has(jointName)) {
      errors.push(
        `Circular dependency detected involving joint "${jointName}"`,
      );
      return;
    }

    visited.add(jointName);
    const joint = structure.joints.find((j) => j.name === jointName);
    if (joint && joint.parent) {
      const parentJoint = structure.joints.find(
        (j) => j.child === joint.parent,
      );
      if (parentJoint) {
        checkCircularDependency(parentJoint.name, visited);
      }
    }
  };

  structure.joints.forEach((joint) => {
    checkCircularDependency(joint.name);
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    linkCount: structure.links.length,
    jointCount: structure.joints.length,
    materialCount: structure.materials.length,
  };
};

// Upload URDF file
router.post(
  "/upload",
  authenticateToken,
  upload.single("urdfFile"),
  [
    body("name").optional().isLength({ min: 1, max: 100 }).trim(),
    body("description").optional().isLength({ max: 500 }).trim(),
    body("robotType")
      .isIn(["4wd", "humanoid", "arm", "drone", "custom"])
      .withMessage("Invalid robot type"),
    body("category")
      .isIn([
        "exploration",
        "industrial",
        "surveillance",
        "research",
        "education",
      ])
      .withMessage("Invalid category"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Clean up uploaded file if validation fails
        if (req.file) {
          await fs.unlink(req.file.path);
        }
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const { name, description, robotType, category, tags, visibility } =
        req.body;

      // Read and parse file content
      const content = await fs.readFile(req.file.path, "utf8");

      // Calculate file checksum
      const checksum = crypto
        .createHash("sha256")
        .update(content)
        .digest("hex");

      // Check for duplicate files
      const existingFile = await URDFFile.findOne({
        checksum,
        owner: req.userId,
      });

      if (existingFile) {
        await fs.unlink(req.file.path);
        return res.status(400).json({
          success: false,
          message: "File already exists",
          data: { existingFile: existingFile.toJSON() },
        });
      }

      // Parse URDF structure
      const structure = await parseURDFContent(content);

      // Validate URDF
      const validation = validateURDF(structure);

      // Create URDF file record
      const urdfFile = new URDFFile({
        name: name || req.file.originalname.replace(/\.[^/.]+$/, ""),
        originalName: req.file.originalname,
        description,
        filePath: path.relative("uploads", req.file.path),
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        checksum,
        robotType,
        category,
        structure,
        validation,
        tags: tags ? tags.map((tag) => tag.toLowerCase().trim()) : [],
        visibility: visibility || "private",
        owner: req.userId,
      });

      await urdfFile.save();

      // Add URDF file to user's collection
      const User = (await import("../models/User.js")).default;
      await User.findByIdAndUpdate(req.userId, {
        $push: { urdfFiles: urdfFile._id },
      });

      res.status(201).json({
        success: true,
        message: "URDF file uploaded successfully",
        data: { urdfFile: urdfFile.toJSON() },
      });
    } catch (error) {
      // Clean up uploaded file on error
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }

      console.error("URDF upload error:", error);
      res.status(500).json({
        success: false,
        message: "Upload failed",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
);

// Get user's URDF files
router.get(
  "/",
  authenticateToken,
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Invalid page number"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Invalid limit"),
    query("robotType")
      .optional()
      .isIn(["4wd", "humanoid", "arm", "drone", "custom"]),
    query("category")
      .optional()
      .isIn([
        "exploration",
        "industrial",
        "surveillance",
        "research",
        "education",
      ]),
    query("search").optional().isLength({ min: 1, max: 100 }).trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const {
        page = 1,
        limit = 20,
        robotType,
        category,
        search,
        sortBy = "createdAt",
        order = "desc",
      } = req.query;

      // Build query
      const query = {
        $or: [
          { owner: req.userId },
          { visibility: "public" },
          { "sharedWith.userId": req.userId },
        ],
        isActive: true,
      };

      if (robotType) query.robotType = robotType;
      if (category) query.category = category;
      if (search) {
        query.$and = [
          query.$and || {},
          {
            $or: [
              { name: { $regex: search, $options: "i" } },
              { description: { $regex: search, $options: "i" } },
              { tags: { $in: [new RegExp(search, "i")] } },
            ],
          },
        ];
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Sort options
      const sortOptions = {};
      sortOptions[sortBy] = order === "desc" ? -1 : 1;

      // Execute query
      const urdfFiles = await URDFFile.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("owner", "firstName lastName email")
        .lean();

      const total = await URDFFile.countDocuments(query);

      res.json({
        success: true,
        data: {
          urdfFiles,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      console.error("URDF files fetch error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch URDF files",
      });
    }
  },
);

// Get specific URDF file
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const urdfFile = await URDFFile.findById(req.params.id)
      .populate("owner", "firstName lastName email")
      .populate("associatedRobots");

    if (!urdfFile) {
      return res.status(404).json({
        success: false,
        message: "URDF file not found",
      });
    }

    // Check access permissions
    if (!urdfFile.hasAccess(req.userId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      data: { urdfFile: urdfFile.toJSON() },
    });
  } catch (error) {
    console.error("URDF file fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch URDF file",
    });
  }
});

// Download URDF file
router.get("/:id/download", authenticateToken, async (req, res) => {
  try {
    const urdfFile = await URDFFile.findById(req.params.id);

    if (!urdfFile) {
      return res.status(404).json({
        success: false,
        message: "URDF file not found",
      });
    }

    // Check access permissions
    if (!urdfFile.hasAccess(req.userId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const filePath = path.join("uploads", urdfFile.filePath);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        message: "File not found on disk",
      });
    }

    // Increment download count
    await urdfFile.incrementDownload();

    // Send file
    res.download(filePath, urdfFile.originalName);
  } catch (error) {
    console.error("URDF file download error:", error);
    res.status(500).json({
      success: false,
      message: "Download failed",
    });
  }
});

// Delete URDF file
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const urdfFile = await URDFFile.findById(req.params.id);

    if (!urdfFile) {
      return res.status(404).json({
        success: false,
        message: "URDF file not found",
      });
    }

    // Check if user is owner
    if (urdfFile.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only file owner can delete",
      });
    }

    // Delete file from disk
    const filePath = path.join("uploads", urdfFile.filePath);
    await fs.unlink(filePath).catch(console.error);

    // Remove from database
    await URDFFile.findByIdAndDelete(req.params.id);

    // Remove from user's collection
    const User = (await import("../models/User.js")).default;
    await User.findByIdAndUpdate(req.userId, {
      $pull: { urdfFiles: req.params.id },
    });

    res.json({
      success: true,
      message: "URDF file deleted successfully",
    });
  } catch (error) {
    console.error("URDF file deletion error:", error);
    res.status(500).json({
      success: false,
      message: "Deletion failed",
    });
  }
});

export default router;
