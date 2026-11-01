require("dotenv").config();

const app = require("./app");
const connectToDatabase = require("./config/db");

const port = process.env.PORT || 5000;

async function startServer() {
  // Refuse to start with the example key so a copied setup is not mistaken for a secure one.
  if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET === "replace-this-with-a-long-random-secret"
  ) {
    throw new Error("Set a unique JWT_SECRET in your .env file before starting the API.");
  }

  // Keep the API offline until its database connection is ready.
  await connectToDatabase();

  app.listen(port, () => {
    console.log(`StudioSpace API is listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Could not start StudioSpace API:", error.message);
  process.exitCode = 1;
});
