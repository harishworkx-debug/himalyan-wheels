import { v2 as cloudinary } from "cloudinary";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary credentials missing in environment variables.",
      });
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = "himalyan-wheels/cars";

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      apiSecret
    );

    return res.status(200).json({
      success: true,
      data: {
        signature,
        timestamp,
        apiKey,
        cloudName,
        folder,
      },
    });
  } catch (err: any) {
    console.error("Signature generation error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to generate Cloudinary signature.",
    });
  }
}
