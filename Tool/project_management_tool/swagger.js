const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Project Management Tool API",
      version: "1.0.0",
      description: "API documentation for Project Management Tool backend",
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
      },
    ],
  },
  apis: ["./routes/*.js", "./controllers/*.js", "./swagger-docs.js"], // Include our swagger-docs.js file
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
