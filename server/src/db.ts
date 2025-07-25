import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const db_uri = process.env.DB_URI! || "mongodb://localhost:27017/mydatabase"; //non-null assertion operator - trust that it is not going to be null

export const connectToDB = async () => {
  try {
    await mongoose.connect(db_uri);
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Optional for OAuth users
  googleId: { type: String, unique: true, sparse: true }, // For Google OAuth
  firstName: { type: String },
  lastName: { type: String },
  profilePicture: { type: String },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  // Password reset fields
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  // Email verification
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
}, {
  timestamps: true // adds createdAt and updatedAt
});

const tagSchema = new mongoose.Schema({
  title: { type: String, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // null for global tags, specific userId for user tags
  },
  isGlobal: { type: Boolean, default: false }, // for predefined global tags
});

// Create a compound unique index to allow same tag title for different users
tagSchema.index({ title: 1, userId: 1 }, { unique: true });

const contentTypes = ["image", "video", "article", "audio"];

const contentSchema = new mongoose.Schema({
  link: { type: String, required: true },
  type: { type: String, enum: contentTypes, required: true },
  title: { type: String, required: true },
  notes: { type: String, required: false }, // Optional markdown notes field
  isShared: { type: Boolean, default: false }, // For selective sharing
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    validate: async function (value: mongoose.Schema.Types.ObjectId) {
      const user = await User.findById(value);
      if (!user) {
        throw new Error("User does not exist");
      }
    },
  },
});

const linkSchema = new mongoose.Schema({
  hash: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isPublic: { type: Boolean, default: false },
});

export const User = mongoose.model("User", userSchema);
export const Tag = mongoose.model("Tag", tagSchema);
export const Content = mongoose.model("Content", contentSchema);
export const Link = mongoose.model("Link", linkSchema);
