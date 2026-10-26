import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICarImage {
  url: string;
  public_id: string;
}

export interface ICar extends Document {
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  kilometres_driven: number;
  fuel_type: string;
  transmission: string;
  variant?: string;
  registration_number?: string;
  ownership_count?: number;
  colour?: string;
  registration_state?: string;
  location?: string;
  description?: string;
  features?: string[];
  images: ICarImage[];
  image_urls: string[];
  featured: boolean;
  status: "Available" | "Sold";
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const CarImageSchema = new Schema<ICarImage>(
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  { _id: false }
);

const CarSchema = new Schema<ICar>(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true, min: 1980 },
    price: { type: Number, required: true, min: 0 },
    kilometres_driven: { type: Number, required: true, min: 0 },
    fuel_type: { type: String, required: true, trim: true },
    transmission: { type: String, required: true, trim: true },
    variant: { type: String, trim: true, default: "" },
    registration_number: { type: String, trim: true, default: "" },
    ownership_count: { type: Number, min: 1, default: 1 },
    colour: { type: String, trim: true, default: "" },
    registration_state: { type: String, trim: true, default: "Himachal Pradesh" },
    location: { type: String, trim: true, default: "Solan, HP" },
    description: { type: String, trim: true, default: "" },
    features: { type: [String], default: [] },
    images: { type: [CarImageSchema], default: [] },
    image_urls: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["Available", "Sold"],
      default: "Available",
    },
    slug: { type: String, required: true, unique: true, index: true },
  },
  {
    timestamps: true,
  }
);

// Performance indices
CarSchema.index({ createdAt: -1 });
CarSchema.index({ status: 1 });
CarSchema.index({ featured: 1 });

// Avoid recompiling model if already registered
export const Car: Model<ICar> =
  mongoose.models.Car || mongoose.model<ICar>("Car", CarSchema);
