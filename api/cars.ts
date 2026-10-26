import { connectDB, isDbConnected } from "./lib/db";
import { Car, ICarImage } from "./lib/Car";
import { deleteFromCloudinary } from "./lib/cloudinary";

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

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    await connectDB();
  } catch (err: any) {
    console.error("Database connection error in /api/cars:", err);
  }

  const { method } = req;
  const id = req.query.id as string;
  const slug = req.query.slug as string;

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      // keep as is
    }
  }

  try {
    // 1. GET: Fetch all or single
    if (method === "GET") {
      if (!isDbConnected()) {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }

      // Single car query by ID or Slug
      if (id || slug) {
        let car = null;
        if (id && /^[0-9a-fA-F]{24}$/.test(id)) {
          car = await Car.findById(id).lean();
        }
        if (!car && (slug || id)) {
          car = await Car.findOne({ slug: slug || id }).lean();
        }
        if (!car) {
          return res.status(404).json({ success: false, message: "Car not found" });
        }
        return res.status(200).json({ success: true, data: car });
      }

      // Query all with filters
      const filter: Record<string, any> = {};
      if (req.query.status) filter.status = req.query.status;
      if (req.query.featured === "true") filter.featured = true;

      const cars = await Car.find(filter).sort({ createdAt: -1 }).lean();
      return res.status(200).json({ success: true, count: cars.length, data: cars });
    }

    // 2. POST: Create car
    if (method === "POST") {
      if (!isDbConnected()) {
        return res.status(503).json({
          success: false,
          message: "Database is not connected. Please check MONGODB_URI in Vercel settings.",
        });
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
      } = body || {};

      if (!brand || !model || !year || !price) {
        return res.status(400).json({
          success: false,
          message: "Brand, model, year, and price are required.",
        });
      }

      const imageArray: ICarImage[] = Array.isArray(images) ? images : [];
      const imageUrls = imageArray.map((img) => img.url).filter(Boolean);
      const carSlug = generateSlug(brand, model, variant, Number(year));

      const newCar = new Car({
        name: brand,
        brand,
        model,
        year: Number(year),
        price: Number(price),
        kilometres_driven: Number(kilometres_driven || 0),
        fuel_type: fuel_type || "Petrol",
        transmission: transmission || "Manual",
        variant: variant || "",
        registration_number: registration_number || "",
        ownership_count: ownership_count ? Number(ownership_count) : 1,
        colour: colour || "",
        registration_state: registration_state || "Himachal Pradesh",
        location: location || "Solan, HP",
        description: description || "",
        features: Array.isArray(features) ? features : [],
        images: imageArray,
        image_urls: imageUrls,
        featured: Boolean(featured),
        status: status === "Sold" ? "Sold" : "Available",
        slug: carSlug,
      });

      const saved = await newCar.save();
      return res.status(201).json({ success: true, data: saved });
    }

    // 3. PUT: Update car
    if (method === "PUT") {
      if (!isDbConnected()) {
        return res.status(503).json({ success: false, message: "Database not connected." });
      }

      const targetId = id || req.body?.id || req.body?._id;
      if (!targetId) {
        return res.status(400).json({ success: false, message: "Car ID is required for update." });
      }

      const existingCar = await Car.findById(targetId);
      if (!existingCar) {
        return res.status(404).json({ success: false, message: "Car not found." });
      }

      const updates = body || {};
      const newImages: ICarImage[] = Array.isArray(updates.images)
        ? updates.images
        : existingCar.images;

      // Identify removed images
      const removedImages = existingCar.images.filter(
        (oldImg) => !newImages.some((newImg) => newImg.public_id === oldImg.public_id)
      );

      // Clean up removed images from Cloudinary if not shared
      for (const removed of removedImages) {
        if (removed.public_id) {
          const count = await Car.countDocuments({
            _id: { $ne: existingCar._id },
            "images.public_id": removed.public_id,
          });
          if (count === 0) {
            await deleteFromCloudinary(removed.public_id);
          }
        }
      }

      // Update fields
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
      return res.status(200).json({ success: true, data: updated });
    }

    // 4. DELETE: Delete car
    if (method === "DELETE") {
      if (!isDbConnected()) {
        return res.status(503).json({ success: false, message: "Database not connected." });
      }

      const targetId = id || req.body?.id;
      if (!targetId) {
        return res.status(400).json({ success: false, message: "Car ID is required for delete." });
      }

      const car = await Car.findById(targetId);
      if (!car) {
        return res.status(404).json({ success: false, message: "Car not found." });
      }

      // Clean up Cloudinary images if not shared
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

      await Car.findByIdAndDelete(targetId);
      return res.status(200).json({ success: true, message: "Car successfully deleted." });
    }

    return res.status(405).json({ success: false, message: "Method not allowed" });
  } catch (err: any) {
    console.error("Error in api/cars:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
}
