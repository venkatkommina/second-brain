import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { User } from "./db";

// Only configure Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  if (process.env.NODE_ENV !== "production") {
    console.log("✅ Configuring Google OAuth strategy");
  }

  const callbackURL =
    process.env.NODE_ENV === "production"
      ? `${process.env.SERVER_URL}/api/v1/auth/google/callback`
      : "http://localhost:3001/api/v1/auth/google/callback";

  console.log("=== OAUTH DEBUG ===");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("SERVER_URL:", process.env.SERVER_URL);
  console.log("Callback URL:", callbackURL);
  console.log("Client ID:", process.env.GOOGLE_CLIENT_ID);
  console.log("==================");

  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log("=== GOOGLE STRATEGY CALLBACK ===");
        console.log("Access Token received:", !!accessToken);
        console.log("Profile ID:", profile.id);
        console.log("Profile email:", profile.emails?.[0]?.value);
        console.log("Profile name:", profile.displayName);
        console.log("================================");

        try {
          // Check if user already exists with this Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            console.log("Found existing user by Google ID:", user._id);
            return done(null, user);
          }

          // Check if user exists with same email
          user = await User.findOne({ email: profile.emails?.[0]?.value });

          if (user) {
            console.log(
              "Found existing user by email, linking Google account:",
              user._id
            );
            // Link existing account with Google
            user.googleId = profile.id;
            user.authProvider = "google";
            user.firstName = profile.name?.givenName;
            user.lastName = profile.name?.familyName;
            user.profilePicture = profile.photos?.[0]?.value;
            user.isEmailVerified = true;
            await user.save();
            return done(null, user);
          }

          // Create new user
          console.log("Creating new user for Google account");
          const newUser = new User({
            googleId: profile.id,
            email: profile.emails?.[0]?.value,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            profilePicture: profile.photos?.[0]?.value,
            authProvider: "google",
            isEmailVerified: true,
          });

          await newUser.save();
          console.log("New user created successfully:", newUser._id);
          return done(null, newUser);
        } catch (error) {
          console.error("=== GOOGLE STRATEGY ERROR ===");
          console.error("Error in Google strategy:", error);
          console.error("==============================");
          return done(error, false);
        }
      }
    )
  );
} else {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "⚠️  Google OAuth credentials not found. OAuth will be disabled."
    );
  }
}

// JWT Strategy for API authentication
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!,
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.id);
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Serialize user for session (only if OAuth is enabled)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.serializeUser((user: any, done) => {
    done(null, user._id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}

export default passport;
