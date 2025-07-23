const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel");
const AppError = require("../utils/appError");

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies.jwt;
  }
  return token;
};

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        if (!email || !password) {
          return done(
            new AppError("Please provide email and password!", 400),
            false
          );
        }
        const user = await User.findOne({ email }).select("+password");
        if (!user || !(await user.correctPassword(password, user.password))) {
          return done(new AppError("Incorrect email or password", 401), false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieExtractor,
      ]),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (jwt_payload, done) => {
      try {
        const user = await User.findById(jwt_payload.id);
        if (!user) {
          return done(
            new AppError(
              "The user belonging to this token does no longer exist.",
              401
            ),
            false
          );
        }
        if (user.changedPasswordAfter(jwt_payload.iat)) {
          return done(
            new AppError(
              "User recently changed password! Please log in again.",
              401
            ),
            false
          );
        }
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Use environment variable for callback URL to avoid redirect_uri_mismatch
      callbackURL: process.env.GOOGLE_CALLBACK_URL || `http://localhost:3000/api/v1/users/auth/google/return`,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google authentication callback triggered");
        console.log("Profile:", profile._json);
        const googleId = profile.id;
        let user = await User.findOne({ googleId });
        if (user) {
          console.log("Existing user found:", user.name);
          user.googleProfile = {
            displayName: profile.displayName,
            email: profile.emails[0].value,
            photo: profile.photos[0].value,
          };
          await user.save({ validateBeforeSave: false });
        } else {
          console.log("Creating new user from Google profile");
          user = await User.create({
            googleId,
            name: profile.displayName || `Google User ${googleId.slice(-4)}`,
            email: profile.emails[0].value,
            photo: profile.photos[0].value || "default.jpg",
            authProvider: "google",
            googleProfile: {
              displayName: profile.displayName,
              email: profile.emails[0].value,
              photo: profile.photos[0].value,
            },
            riotUsername:
              profile.displayName || `GoogleUser${googleId.slice(-4)}`,
            riotTag: `GOOG${googleId.slice(-4)}`,
          });
          console.log("New user created:", user.name);
        }
        return done(null, user);
      } catch (error) {
        console.error("Error in Google strategy:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
