import express from "express";
import cors from "cors";
import session from "express-session";
import router from "./routes";
import { connectToDB } from "./db";
import passport from "./passport";

const port = process.env.PORT || 3001;
const app = express();

// Parse JSON bodies
app.use(express.json());

// Session configuration for passport (only if OAuth is enabled)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  app.use(
    session({
      secret:
        process.env.SESSION_SECRET ||
        "your-session-secret-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());
  if (process.env.NODE_ENV !== "production") {
    console.log("✅ Passport middleware initialized");
  }
} else {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "⚠️  OAuth credentials not found. Running without OAuth support."
    );
  }
}

// CORS is now handled in routes.ts with environment variables

app.use("/api/v1", router);

async function startServer() {
  try {
    await connectToDB();
    app.listen(port, () => {
      if (process.env.NODE_ENV !== "production") {
        console.log(`✅ Server started on http://localhost:${port}/api/v1`);
        console.log(`✅ Database connected successfully`);

        if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
          console.log("✅ Google OAuth enabled");
        } else {
          console.log("⚠️  Google OAuth disabled (credentials not found)");
        }
      }

      if (process.env.BREVO_SMTP_KEY || process.env.EMAIL_USER) {
        console.log("✅ Email service configured");
      } else {
        console.log("⚠️  Email service not configured");
      }
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
