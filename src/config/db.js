const mongoose = require("mongoose");

// Read the database address from the environment, never from committed source code.
async function connectToDatabase() {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing. Add it to your .env file.");
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");
}

module.exports = connectToDatabase;
