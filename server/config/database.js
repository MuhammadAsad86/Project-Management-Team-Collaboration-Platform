const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("Please define the MONGO_URI environment variable");
}

/**
 * Vercel freezes/thaws the Node process between invocations and can also
 * spin up multiple concurrent instances. A fresh `mongoose.connect()` call
 * per request (or per cold start, uncached) is what produces
 * `users.findOne() buffering timed out after 10000ms`: Mongoose queues the
 * query for up to 10s waiting on a connection that never finishes forming.
 *
 * The fix is to cache the connection promise on the Node global object so
 * warm invocations reuse the same connection instead of racing to create a
 * new one.
 */
let cached = global._mongooseConn;

if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    mongoose.set("strictQuery", true);

    cached.promise = mongoose
      .connect(MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        // Fail fast instead of silently queueing queries for 10s while a
        // connection is (or isn't) being established.
        bufferCommands: false,
      })
      .then((mongooseInstance) => {
        console.log(`MongoDB Connected: ${mongooseInstance.connection.host}`);
        return mongooseInstance;
      })
      .catch((error) => {
        // Let the next call retry instead of caching a permanently broken promise.
        cached.promise = null;
        console.error("MongoDB Connection Failed:", error.message);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;