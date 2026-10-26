export default async function handler(_req: any, res: any) {
  const diagnostics: Record<string, any> = {
    nodeVersion: process.version,
    envKeys: Object.keys(process.env).filter((k) => !k.includes("SECRET") && !k.includes("KEY")),
    hasMongoUri: Boolean(process.env.MONGODB_URI),
    hasCloudName: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
    hasCloudApiKey: Boolean(process.env.CLOUDINARY_API_KEY),
    hasCloudSecret: Boolean(process.env.CLOUDINARY_API_SECRET),
  };

  try {
    const cloudLib = await import("./lib/cloudinary");
    diagnostics.cloudLibLoaded = true;
    diagnostics.isCloudinaryConfigured = cloudLib.isCloudinaryConfigured();
  } catch (err: any) {
    diagnostics.cloudLibError = err.stack || err.message;
  }

  try {
    const dbLib = await import("./lib/db");
    diagnostics.dbLibLoaded = true;
    diagnostics.isDbConnected = dbLib.isDbConnected();
  } catch (err: any) {
    diagnostics.dbLibError = err.stack || err.message;
  }

  try {
    const carModel = await import("./lib/Car");
    diagnostics.carModelLoaded = true;
  } catch (err: any) {
    diagnostics.carModelError = err.stack || err.message;
  }

  return res.status(200).json(diagnostics);
}
