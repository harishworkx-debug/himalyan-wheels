import { uploadToCloudinary, isCloudinaryConfigured } from "../server/cloudinary";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    if (!isCloudinaryConfigured()) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary credentials not configured in Vercel environment variables.",
      });
    }

    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        // keep as is
      }
    }

    const { image } = body || {};
    if (!image) {
      return res.status(400).json({ success: false, message: "No image payload received." });
    }

    const uploaded = await uploadToCloudinary(image);
    return res.status(200).json({ success: true, data: uploaded });
  } catch (err: any) {
    console.error("api/upload error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to upload image to Cloudinary.",
    });
  }
}

