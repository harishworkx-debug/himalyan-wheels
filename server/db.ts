import mongoose from "mongoose";

let isConnected = false;

export async function connectDB(): Promise<typeof mongoose | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("MONGODB_URI is not set in environment variables.");
    return null;
  }

  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  try {
    const db = await mongoose.connect(uri, {
      bufferCommands: false,
    });
    isConnected = db.connection.readyState === 1;
    console.log("Connected to MongoDB Atlas");
    return db;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
