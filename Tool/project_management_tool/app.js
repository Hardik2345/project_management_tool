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

const userRouter = require("./routes/userRoutes");
const projectRouter = require("./routes/projectRoutes");
const taskRouter = require("./routes/taskRoutes");
const clientRouter = require("./routes/clientRoutes");
const timerRoutes = require("./routes/timerRoutes");
// const AppError = require("./utils/appError");
// const globalErrorHandler = require("./controllers/errorController");

const app = express();
app.enable("trust proxy", 1);

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://accounts.google.com",
      "https://project-management-tool-peach.vercel.app",
      "https://project-management-t-git-bbeb2d-raghav-kumars-projects-e04ee19e.vercel.app",
    ],
    credentials: true,
  })
);

// app.options(
//   "*",
//   cors({
//     credentials: true,
//     origin: ["http://localhost:5173", "https://accounts.google.com"],
//   })
// );

app.use(express.static(path.join(__dirname, "public")));

app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// app.use((req, res, next) => {
//   if (req.originalUrl.includes("?")) {
//     req.query = querystring.parse(req.originalUrl.split("?")[1]);
//   }
//   next();
// });

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(compression());

const mongoUrl = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

const sessionStore = MongoStore.create({
  mongoUrl: mongoUrl,
  collectionName: "sessions", // It's good practice to name the collection
  touchAfter: 24 * 3600, // 24 hours
});

app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api/v1/users/auth/google")) {
    console.log("Bypassing session for Google routes");
    return next();
  }
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })(req, res, next);
});

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/clients", clientRouter);
app.use("/api/v1/timers", timerRoutes);

// app.all("*", (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });

// app.use(globalErrorHandler);

module.exports = app;
