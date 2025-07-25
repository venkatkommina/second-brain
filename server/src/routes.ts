import express from "express";
import bcrypt from "bcrypt";
import { Content, Link, Tag, User } from "./db";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import {
  userValidation,
  tagValidation,
  contentValidation,
} from "@venkat91/second-brain-common";

import crypto from "crypto";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import passport from "./passport";
import { sendPasswordResetEmail, sendWelcomeEmail } from "./emailService";

interface AuthenticatedRequest extends Request {
  email?: string;
}

const router = express.Router();

// Security middleware
router.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: process.env.NODE_ENV === "production" ? 5 : 1000, // 5 in production, 1000 in development (effectively unlimited)
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Get allowed origins from environment variable
const getAllowedOrigins = () => {
  const corsOrigins = process.env.CORS_ORIGINS;
  if (corsOrigins) {
    return corsOrigins.split(",").map((origin) => origin.trim());
  }
  // Default to localhost for development
  return [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5174",
  ];
};

router.use(
  cors({
    origin: getAllowedOrigins(),
    credentials: true, // if you're using cookies or auth headers
  })
);

router.use(express.json());

const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err || typeof decoded !== "object" || !decoded) {
      res.sendStatus(403);
      return;
    }
    req.email = decoded.email;
    next();
  });
};

router.get("/", (req, res) => {
  res.send("Hello world!");
});

// Get current user info
router.get(
  "/me",
  authenticateToken,
  async (req: AuthenticatedRequest, res): Promise<any> => {
    try {
      const user = await User.findOne({ email: req.email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user._id,
        email: user.email,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.post("/signup", authLimiter, async (req, res): Promise<any> => {
  try {
    const user = req.body;

    const { success, error } = userValidation.safeParse(user);

    if (!success) {
      return res.status(411).json(error.errors[0]);
    }

    const { email, password } = user;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(403)
        .json({ message: "User already exists with this username" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      authProvider: "local",
    });
    await newUser.save();

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email).catch((err) =>
      console.error("Failed to send welcome email:", err)
    );

    res
      .status(201)
      .json({ message: "User created successfully", id: newUser._id });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/signin", authLimiter, async (req, res): Promise<any> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(403).json({ message: "Invalid credentials" });
    }

    // Check if user has a password (local auth) or uses OAuth
    if (!user.password) {
      return res.status(403).json({
        message: "Please sign in with Google or reset your password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(403).json({ message: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const token = jwt.sign({ email, id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({ token });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// Password Reset Routes
router.post("/forgot-password", authLimiter, async (req, res): Promise<any> => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({
        message:
          "If an account with that email exists, we've sent a password reset link",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send email
    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(500).json({ message: "Failed to send reset email" });
    }

    res.status(200).json({
      message:
        "If an account with that email exists, we've sent a password reset link",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// Password reset - verify token
router.get("/verify-reset-token/:token", async (req, res): Promise<any> => {
  try {
    const { token } = req.params;

    // Hash the token to compare with stored hash (same as in forgot-password)
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    res.json({ message: "Token is valid" });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/reset-password", authLimiter, async (req, res): Promise<any> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and password are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// Check if OAuth is enabled
const isOAuthEnabled =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

// Google OAuth Routes (only if OAuth is enabled)
if (isOAuthEnabled) {
  if (process.env.NODE_ENV !== "production") {
    console.log("✅ Google OAuth routes enabled");
  }

  router.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  router.get(
    "/auth/google/callback",
    passport.authenticate("google", { session: false }),
    async (req: any, res): Promise<any> => {
      try {
        const user = req.user;

        if (!process.env.JWT_SECRET) {
          throw new Error("JWT_SECRET is not defined in environment variables");
        }

        const token = jwt.sign(
          { email: user.email, id: user._id },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        // Redirect to frontend with token
        const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
        res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        }
        const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
        res.redirect(
          `${frontendUrl}/login?error=${encodeURIComponent(
            "Authentication failed"
          )}`
        );
      }
    }
  );
} else {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "⚠️  Google OAuth routes disabled - credentials not configured"
    );
  }

  // Provide fallback routes that return error
  router.get("/auth/google", (req, res) => {
    res
      .status(503)
      .json({ message: "Google OAuth is not configured on this server" });
  });

  router.get("/auth/google/callback", (req, res) => {
    res
      .status(503)
      .json({ message: "Google OAuth is not configured on this server" });
  });
}

router.post(
  "/tag",
  authenticateToken,
  async (req: AuthenticatedRequest, res): Promise<any> => {
    try {
      const tag = req.body;
      const { success, error } = tagValidation.safeParse(tag);
      if (!success) {
        return res
          .status(411)
          .json({ message: "Invalid input", error: error.errors[0] });
      }

      const user = await User.findOne({ email: req.email });
      if (!user) {
        return res.status(403).json({ message: "User not found" });
      }

      // Check if tag already exists for this user or as a global tag
      const existingTag = await Tag.findOne({
        title: tag.title,
        $or: [
          { userId: user._id }, // user's own tag
          { isGlobal: true }, // global tag
        ],
      });

      if (existingTag) {
        return res.status(403).json({ message: "Tag already exists" });
      }

      const newTag = new Tag({
        title: tag.title,
        userId: user._id,
        isGlobal: false,
      });
      await newTag.save();

      return res.status(200).json(newTag);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get(
  "/tag",
  authenticateToken,
  async (req: AuthenticatedRequest, res): Promise<any> => {
    try {
      const user = await User.findOne({ email: req.email });
      if (!user) {
        return res.status(403).json({ message: "User not found" });
      }

      // Get user's own tags and global tags
      const tags = await Tag.find({
        $or: [
          { userId: user._id }, // user's own tags
          { isGlobal: true }, // global tags (userId is null)
        ],
      });

      res.status(200).json(tags);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      res.status(500).json(error);
    }
  }
);

router.post(
  "/content",
  authenticateToken,
  async (req: AuthenticatedRequest, res): Promise<any> => {
    try {
      const content = req.body;
      const { success, error } = contentValidation.safeParse(content);

      if (!success) {
        return res.status(411).json(error.errors[0]);
      }
      const user = await User.findOne({ email: req.email });
      content.userId = user?._id;
      const newDoc = new Content(content);
      await newDoc.save();

      res.status(200).json({
        message: "New doc added to the content successfully.",
        id: newDoc._id,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get(
  "/content",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const email = req.email;

      const user = await User.findOne({ email });

      const content = await Content.find({ userId: user?._id }).populate(
        "tags"
      );

      res.status(200).json(content);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.delete("/content/:contentId", async (req: AuthenticatedRequest, res) => {
  try {
    const contentId = req.params.contentId;

    const content = await Content.findOne({ _id: contentId });

    if (!content) {
      res.status(400).json({
        message: "Can't find the doc you're asking to delete, check again",
      });
      return;
    }

    const user = await User.findOne({ email: req.email });
    if (user?._id != content.userId || !user) {
      res
        .status(400)
        .json({ message: "You are not allowed to delete this doc" });
      return;
    }

    await Content.deleteOne({ _id: contentId });
    res.status(200).json({ message: "Content deleted successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put(
  "/content/:contentId",
  authenticateToken,
  async (req: AuthenticatedRequest, res): Promise<any> => {
    try {
      const contentId = req.params.contentId;
      const updatedData = req.body;

      const { success, error } = contentValidation.safeParse(updatedData);
      if (!success) {
        return res.status(411).json(error.errors[0]);
      }

      const content = await Content.findOne({ _id: contentId });
      if (!content) {
        return res.status(404).json({
          message: "Content not found",
        });
      }

      const user = await User.findOne({ email: req.email });
      if (!user || user._id.toString() !== content.userId.toString()) {
        return res
          .status(403)
          .json({ message: "You are not allowed to update this content" });
      }

      const updatedContent = await Content.findByIdAndUpdate(
        contentId,
        updatedData,
        { new: true }
      ).populate("tags");

      res.status(200).json({
        message: "Content updated successfully",
        content: updatedContent,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get brain sharing status
router.get(
  "/brain/status",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const user = await User.findOne({ email: req.email });
      if (!user) {
        res.status(403).json({ message: "User not found" });
        return;
      }

      const link = await Link.findOne({ userId: user._id });
      if (!link) {
        res.status(200).json({
          isPublic: false,
          link: null,
        });
        return;
      }

      res.status(200).json({
        isPublic: link.isPublic,
        link: link.isPublic
          ? `${req.protocol}://${req.get("host")}/api/v1/brain/${link.hash}`
          : null,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.post(
  "/brain/share",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const user = await User.findOne({ email: req.email });
      if (!user) {
        res.status(403).json({ message: "User not found" });
        return;
      }

      let link = await Link.findOne({ userId: user._id });

      if (!link) {
        const hash = crypto.randomBytes(8).toString("hex");
        link = new Link({ hash, userId: user._id, isPublic: true });
        await link.save();
        res.status(200).json({
          message: "Sharing enabled",
          link: `${req.protocol}://${req.get("host")}/api/v1/brain/${
            link.hash
          }`,
        });
        return;
      }

      // If already exists → toggle
      link.isPublic = !link.isPublic;
      await link.save();

      const statusMessage = link.isPublic
        ? "Sharing enabled"
        : "Sharing disabled";

      res.status(200).json({
        message: statusMessage,
        link: `${req.protocol}://${req.get("host")}/api/v1/brain/${link.hash}`,
        isPublic: link.isPublic,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get("/brain/:hash", async (req, res) => {
  try {
    const { hash } = req.params;

    const link = await Link.findOne({ hash });
    if (!link || !link.isPublic) {
      res.status(404).json({
        message: "The brain you're looking for is not public or invalid.",
      });
      return;
    }

    const content = await Content.find({
      userId: link.userId,
      isShared: true,
    }).populate("tags");

    res.status(200).json(content);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// Toggle content sharing status
router.patch(
  "/content/:contentId/share",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const contentId = req.params.contentId;
      const { isShared } = req.body;

      const content = await Content.findOne({ _id: contentId });
      if (!content) {
        res.status(404).json({ message: "Content not found" });
        return;
      }

      const user = await User.findOne({ email: req.email });
      if (!user || user._id.toString() !== content.userId.toString()) {
        res.status(403).json({
          message: "You are not allowed to modify this content",
        });
        return;
      }

      const updatedContent = await Content.findByIdAndUpdate(
        contentId,
        { isShared: isShared },
        { new: true }
      ).populate("tags");

      res.status(200).json({
        message: `Content ${isShared ? "shared" : "unshared"} successfully`,
        content: updatedContent,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Bulk share all content
router.post(
  "/content/share-all",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const user = await User.findOne({ email: req.email });
      if (!user) {
        res.status(403).json({ message: "User not found" });
        return;
      }

      // Set all user's content to shared
      await Content.updateMany({ userId: user._id }, { isShared: true });

      res.status(200).json({
        message: "All content shared successfully",
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
