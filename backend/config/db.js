import mongoose from "mongoose";

// Serverless functions (Vercel) reuse warm instances, so the connection promise is
// cached and shared across requests instead of reconnecting every time.
let connection = null;

const connectDB = async () => {
  if (!connection) {
    connection = mongoose
      .connect(process.env.MONGO_URI)
      .then((conn) => {
        console.log("MongoDB connected");
        return conn;
      })
      .catch((error) => {
        connection = null; // allow a retry on the next request
        throw error;
      });
  }

  return connection;
};

export default connectDB;
