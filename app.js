const path = require("path");
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
require("./config/passport");
const passport = require("passport");
const querystring = require('querystring');
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");

const userRouter = require("./routes/userRoutes");


const app = express();
app.enable("trust proxy", 1);

app.use(
  cors({
    origin: ["http://localhost:5173", "https://accounts.google.com"],
    credentials: true,
  })
);

app.options("*", cors({ credentials: true, origin: ["http://localhost:5173", "https://accounts.google.com"] }));

app.use(express.static(path.join(__dirname, "public")));

app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use((req, res, next) => {
  if (req.originalUrl.includes('?')) {
    req.query = querystring.parse(req.originalUrl.split('?')[1]);
  }
  next();
});

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(compression());
app.use(xss());
app.use(mongoSanitize());

app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/v1/users/auth/google')) {
    console.log('Bypassing session for Google routes');
    return next();
  }
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DATABASE.replace(
        "<PASSWORD>",
        process.env.DATABASE_PASSWORD
      ),
      touchAfter: 24 * 3600,
    }),
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })(req, res, next);
});

app.use(passport.initialize());

require("./swagger")(app);

app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;