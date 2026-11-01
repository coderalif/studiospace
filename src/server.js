require("dotenv").config();

const app = require("./app");
const connectToDatabase = require("./config/db");

const port = process.env.PORT || 5000;

async function startServer() {
  if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET === "replace-this-with-a-long-random-secret"
  ) {
    throw new Error("Set a unique JWT_SECRET in your .env file before starting the API.");
  }

  await connectToDatabase();

  app.listen(port, () => {
    console.log(`StudioSpace API is listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Could not start StudioSpace API:", error.message);
  process.exitCode = 1;
});
