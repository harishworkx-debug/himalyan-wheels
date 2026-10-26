import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { connectDB, isDbConnected } from "./db";
import { Car, ICarImage } from "./models/Car";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  isCloudinaryConfigured,
} from "./cloudinary";

const app = express();

// Middleware
app.use(cors());
// 25MB limit to comfortably allow image uploads via data URIs
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Helper to generate SEO friendly unique slug
function generateSlug(brand: string, model: string, variant?: string, year?: number): string {
  const base = [brand, model, variant, year ? String(year) : ""]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${base || "car"}-${randomSuffix}`;
}

// Ensure DB is connected before handling requests
app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await connectDB();
  } catch (err) {
    console.warn("DB connection attempt warning:", err);
  }
  next();
});

// 1. Health & Config Check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    database: isDbConnected() ? "connected" : "not_connected",
    cloudinary: isCloudinaryConfigured() ? "configured" : "not_configured",
    timestamp: new Date().toISOString(),
  });
});

// 2. Upload image to Cloudinary
app.post("/api/upload", async (req: Request, res: Response): Promise<void> => {
  try {
    const { image } = req.body;
    if (!image || typeof image !== "string") {
      res.status(400).json({ success: false, message: "Image data URI is required." });
      return;
    }

    // Basic size validation for base64: approx 5MB max
    const approxBytes = (image.length * 3) / 4;
    if (approxBytes > 6 * 1024 * 1024) {
      res.status(400).json({ success: false, message: "Image exceeds 5 MB limit." });
      return;
    }

    const uploaded = await uploadToCloudinary(image);
    res.status(200).json({ success: true, data: uploaded });
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload image to Cloudinary.",
    });
  }
});

// 3. Fetch all cars
app.get("/api/cars", async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isDbConnected()) {
      res.status(200).json({
        success: true,
        count: 0,
        data: [],
        note: "MongoDB Atlas is not connected yet.",
      });
      return;
    }

    const filter: Record<string, any> = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.featured === "true") {
      filter.featured = true;
    }

    const cars = await Car.find(filter).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: cars.length, data: cars });
  } catch (error: any) {
    console.error("Error fetching cars:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve cars from database.",
    });
  }
});

// 4. Fetch a single car by ID or Slug
app.get("/api/cars/:idOrSlug", async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isDbConnected()) {
      res.status(503).json({ success: false, message: "Database not connected." });
      return;
    }

    const { idOrSlug } = req.params;
    let car = null;

    // Try finding by MongoDB ObjectId if format matches
    if (/^[0-9a-fA-F]{24}$/.test(idOrSlug)) {
      car = await Car.findById(idOrSlug).lean();
    }

    // If not found, try slug
    if (!car) {
      car = await Car.findOne({ slug: idOrSlug }).lean();
    }

    if (!car) {
      res.status(404).json({ success: false, message: "Car not found." });
      return;
    }

    res.status(200).json({ success: true, data: car });
  } catch (error: any) {
    console.error("Error fetching car:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to fetch car." });
  }
});

// 5. Add a new car
app.post("/api/cars", async (req: Request, res: Response): Promise<void> => {
  const imagesToCleanupOnError: ICarImage[] = Array.isArray(req.body.images)
    ? req.body.images
    : [];

  try {
    if (!isDbConnected()) {
      // Clean up newly uploaded images if DB is unreachable
      for (const img of imagesToCleanupOnError) {
        if (img?.public_id) await deleteFromCloudinary(img.public_id);
      }
      res.status(503).json({
        success: false,
        message: "Database is not connected. Please verify MONGODB_URI.",
      });
      return;
    }

    const {
      brand,
      model,
      year,
      price,
      kilometres_driven,
      fuel_type,
      transmission,
      variant,
      registration_number,
      ownership_count,
      colour,
      registration_state,
      location,
      description,
      features,
      images,
      featured,
      status,
    } = req.body;

    // Field validation
    if (!brand || !model) {
      res.status(400).json({ success: false, message: "Brand and model are required." });
      return;
    }
    if (!year || Number(year) < 1980) {
      res.status(400).json({ success: false, message: "Valid manufacturing year is required." });
      return;
    }
    if (!price || Number(price) <= 0) {
      res.status(400).json({ success: false, message: "Valid price is required." });
      return;
    }
    if (kilometres_driven === undefined || Number(kilometres_driven) < 0) {
      res.status(400).json({ success: false, message: "Valid kilometres driven is required." });
      return;
    }
    if (!fuel_type || !transmission) {
      res.status(400).json({ success: false, message: "Fuel type and transmission are required." });
      return;
    }
    if (!images || !Array.isArray(images) || images.length === 0) {
      res.status(400).json({ success: false, message: "At least one car photo is required." });
      return;
    }

    // Extract image URLs array for convenience
    const imageUrls = images.map((img: ICarImage) => img.url).filter(Boolean);
    const slug = generateSlug(brand, model, variant, Number(year));

    const newCar = new Car({
      name: brand,
      brand,
      model,
      year: Number(year),
      price: Number(price),
      kilometres_driven: Number(kilometres_driven),
      fuel_type,
      transmission,
      variant: variant || "",
      registration_number: registration_number || "",
      ownership_count: ownership_count ? Number(ownership_count) : 1,
      colour: colour || "",
      registration_state: registration_state || "Himachal Pradesh",
      location: location || "Solan, HP",
      description: description || "",
      features: Array.isArray(features) ? features : [],
      images: images,
      image_urls: imageUrls,
      featured: Boolean(featured),
      status: status === "Sold" ? "Sold" : "Available",
      slug,
    });

    const saved = await newCar.save();
    res.status(201).json({ success: true, data: saved });
  } catch (error: any) {
    console.error("Error creating car:", error);

    // Rollback: delete newly uploaded Cloudinary images if database insertion fails
    for (const img of imagesToCleanupOnError) {
      if (img?.public_id) {
        await deleteFromCloudinary(img.public_id);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create car listing in MongoDB.",
    });
  }
});

// 6. Update an existing car
app.put("/api/cars/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isDbConnected()) {
      res.status(503).json({ success: false, message: "Database not connected." });
      return;
    }

    const { id } = req.params;
    const existingCar = await Car.findById(id);
    if (!existingCar) {
      res.status(404).json({ success: false, message: "Car not found." });
      return;
    }

    const updates = req.body;
    const newImages: ICarImage[] = Array.isArray(updates.images)
      ? updates.images
      : existingCar.images;

    // Detect removed images
    const removedImages = existingCar.images.filter(
      (oldImg) => !newImages.some((newImg) => newImg.public_id === oldImg.public_id)
    );

    // Clean up removed images from Cloudinary ONLY IF no other car is using that public_id
    for (const removed of removedImages) {
      if (removed.public_id) {
        const otherRef = await Car.countDocuments({
          _id: { $ne: existingCar._id },
          "images.public_id": removed.public_id,
        });
        if (otherRef === 0) {
          await deleteFromCloudinary(removed.public_id);
        }
      }
    }

    // Apply updates
    if (updates.brand) existingCar.brand = updates.brand;
    if (updates.name || updates.brand) existingCar.name = updates.name || updates.brand;
    if (updates.model) existingCar.model = updates.model;
    if (updates.year !== undefined) existingCar.year = Number(updates.year);
    if (updates.price !== undefined) existingCar.price = Number(updates.price);
    if (updates.kilometres_driven !== undefined)
      existingCar.kilometres_driven = Number(updates.kilometres_driven);
    if (updates.fuel_type) existingCar.fuel_type = updates.fuel_type;
    if (updates.transmission) existingCar.transmission = updates.transmission;
    if (updates.variant !== undefined) existingCar.variant = updates.variant;
    if (updates.registration_number !== undefined)
      existingCar.registration_number = updates.registration_number;
    if (updates.ownership_count !== undefined)
      existingCar.ownership_count = Number(updates.ownership_count);
    if (updates.colour !== undefined) existingCar.colour = updates.colour;
    if (updates.registration_state !== undefined)
      existingCar.registration_state = updates.registration_state;
    if (updates.location !== undefined) existingCar.location = updates.location;
    if (updates.description !== undefined) existingCar.description = updates.description;
    if (updates.features !== undefined) existingCar.features = updates.features;
    if (updates.featured !== undefined) existingCar.featured = Boolean(updates.featured);
    if (updates.status !== undefined) existingCar.status = updates.status;

    existingCar.images = newImages;
    existingCar.image_urls = newImages.map((i) => i.url);

    const updated = await existingCar.save();
    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Error updating car:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update car listing.",
    });
  }
});

// 7. Delete a car and clean up its Cloudinary images
app.delete("/api/cars/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isDbConnected()) {
      res.status(503).json({ success: false, message: "Database not connected." });
      return;
    }

    const { id } = req.params;
    const car = await Car.findById(id);
    if (!car) {
      res.status(404).json({ success: false, message: "Car not found." });
      return;
    }

    // Clean up images from Cloudinary ONLY IF no other car is using that public_id
    if (car.images && car.images.length > 0) {
      for (const img of car.images) {
        if (img.public_id) {
          const count = await Car.countDocuments({
            _id: { $ne: car._id },
            "images.public_id": img.public_id,
          });
          if (count === 0) {
            await deleteFromCloudinary(img.public_id);
          }
        }
      }
    }

    await Car.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Car and images successfully deleted." });
  } catch (error: any) {
    console.error("Error deleting car:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete car.",
    });
  }
});

export default app;
