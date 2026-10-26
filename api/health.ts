import { connectDB, isDbConnected } from "../server/db";
import { isCloudinaryConfigured } from "../server/cloudinary";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    await connectDB();
    return res.status(200).json({
      status: "ok",
      database: isDbConnected() ? "connected" : "not_connected",
      cloudinary: isCloudinaryConfigured() ? "configured" : "not_configured",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Health check error:", err);
    return res.status(200).json({
      status: "degraded",
      database: "connection_error",
      error: err?.message,
      cloudinary: isCloudinaryConfigured() ? "configured" : "not_configured",
      timestamp: new Date().toISOString(),
    });
  }
}
