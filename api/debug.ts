import fs from "fs";
import path from "path";

export default async function handler(_req: any, res: any) {
  const diagnostics: Record<string, any> = {
    nodeVersion: process.version,
    cwd: process.cwd(),
    hasMongoUri: Boolean(process.env.MONGODB_URI),
    hasCloudName: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
    hasCloudApiKey: Boolean(process.env.CLOUDINARY_API_KEY),
    hasCloudSecret: Boolean(process.env.CLOUDINARY_API_SECRET),
  };

  try {
    diagnostics.rootFiles = fs.readdirSync(process.cwd());
  } catch (e: any) {
    diagnostics.rootFilesErr = e.message;
  }

  try {
    const apiDir = path.join(process.cwd(), "api");
    if (fs.existsSync(apiDir)) {
      diagnostics.apiFiles = fs.readdirSync(apiDir);
    }
  } catch (e: any) {
    diagnostics.apiFilesErr = e.message;
  }

  // Test importing with .js extension vs without
  try {
    const cloudLib = await import("./lib/cloudinary.js");
    diagnostics.cloudLibWithExt = true;
  } catch (err: any) {
    diagnostics.cloudLibWithExtErr = err.message;
  }


  try {
    const cloudLib = await import("./lib/cloudinary.js");
    diagnostics.cloudLibLoaded = true;
    diagnostics.isCloudinaryConfigured = cloudLib.isCloudinaryConfigured();
  } catch (err: any) {
    diagnostics.cloudLibError = err.message;
  }

  try {
    const dbLib = await import("./lib/db.js");
    diagnostics.dbLibLoaded = true;
    diagnostics.isDbConnected = dbLib.isDbConnected();
  } catch (err: any) {
    diagnostics.dbLibError = err.message;
  }

  try {
    const carModel = await import("./lib/Car.js");
    diagnostics.carModelLoaded = true;
  } catch (err: any) {
    diagnostics.carModelError = err.message;
  }

  return res.status(200).json(diagnostics);
}

