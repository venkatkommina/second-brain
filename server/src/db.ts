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
  password: { type: String, required: true },
});

const tagSchema = new mongoose.Schema({
  title: { type: String, required: true },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: false // null for global tags, specific userId for user tags
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
