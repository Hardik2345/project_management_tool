require("dotenv").config();
const mongoose = require("mongoose");
const http = require("http");

process.on("uncaughtException", (err) => {
  console.log("Unhandled exception! 💥 shutting down....");
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require("./app");
const setupSwagger = require("./swagger");
const server = http.createServer(app);

// Initialize Swagger documentation
setupSwagger(app);

// Warn if DATABASE env vars are missing, but continue so server can bind a port
if (!process.env.DATABASE) {
  console.warn(
    "Warning: DATABASE environment variable is not defined. DB connection will fail."
  );
}
if (!process.env.DATABASE_PASSWORD) {
  console.warn(
    "Warning: DATABASE_PASSWORD environment variable is not defined. DB connection will fail."
  );
}
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

//Explicitly set the NODE_ENV for Express
app.set("env", process.env.NODE_ENV);

console.log("Enviroment:", process.env.NODE_ENV);

mongoose
  .connect(DB, {
    ssl: true,
    maxPoolSize: 5, // Increase connection pool size
    ssl: true,
    tlsAllowInvalidCertificates: true,
  })
  .then((con) => {
    console.log("DB connection succesful!");
  });
// Add connection monitoring
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
});
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection! 💥 shutting down....");
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM RECIEVED. Shutting down gracefully");
  server.close(() => {
    console.log("Process terminated!");
  });
});
