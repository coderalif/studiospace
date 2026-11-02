const mongoose = require("mongoose");

let connectionPromise;

// Read the database address from the environment, never from committed source code.
async function connectToDatabase() {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing. Add it to your .env file.");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(MONGODB_URI)
      .then(() => {
        console.log("Connected to MongoDB");
        return mongoose.connection;
      })
      .finally(() => {
        connectionPromise = null;
      });
  }

  return connectionPromise;
}

module.exports = connectToDatabase;
