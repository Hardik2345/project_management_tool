const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Email = require("./../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    sameSite: "Lax",
  });
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    riotTag: req.body.riotTag,
    riotUsername: req.body.riotUsername,
  });
  const url = `${req.protocol}://${req.get("host")}/me`;
  req.login(newUser, (err) => {
    if (err) {
      return next(err);
    }
    createSendToken(newUser, 201, req, res);
  });
});

exports.login = catchAsync(async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(new AppError("Incorrect email or password", 401));
    }
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      createSendToken(user, 200, req, res);
    });
  })(req, res, next);
});

exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ status: "error", message: err.message });
    }
    res.cookie("jwt", "loggedout", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.status(200).json({ status: "success" });
  });
};

exports.protect = passport.authenticate("jwt", { session: false });

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt && req.cookies.jwt !== "loggedout") {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      res.locals.user = currentUser;
      req.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  try {
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  req.login(user, (err) => {
    if (err) {
      return next(err);
    }
    createSendToken(user, 200, req, res);
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createSendToken(user, 200, req, res);
});

exports.googleAuth = passport.authenticate("google", { session: false, scope: ['profile', 'email'] });

exports.googleCallback = (req, res, next) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  try {
    passport.authenticate("google", { session: false }, async (err, user, info) => {
      console.log("entered passport.authenticate for Google");
      try {
        if (err) {
          console.error("Google auth error:", err);
          return res.redirect(
            `${frontendUrl}/login?error=google_auth_failed`
          );
        }
        if (!user) {
          console.error("No user returned from Google auth", info);
          return res.redirect(
            `${frontendUrl}/login?error=google_auth_failed`
          );
        }
        const token = signToken(user._id);
        res.cookie("jwt", token, {
          expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
          ),
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
        });
        console.log(`Google authentication successful for user: ${user.name}`);
        console.log(`Redirecting to: ${frontendUrl}/dashboard`);
        return res.redirect(`${frontendUrl}/dashboard`);
      } catch (error) {
        console.error("Error in Google callback:", error);
        return res.redirect(
          `${frontendUrl}/login?error=google_auth_failed`
        );
      }
    })(req, res, next);
  } catch (error) {
    console.error("Error in passport.authenticate:", error);
    res.status(500).send("Internal Server Error");
  }
};