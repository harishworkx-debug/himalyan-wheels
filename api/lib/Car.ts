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
  features: string[];
  images: ICarImage[];
  image_urls: string[];
  featured: boolean;
  status: "Available" | "Sold" | "Pending";
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
    year: { type: Number, required: true, min: 1980, max: 2035 },
    price: { type: Number, required: true, min: 0 },
    kilometres_driven: { type: Number, default: 0, min: 0 },
    fuel_type: {
      type: String,
      required: true,
      enum: ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"],
      default: "Petrol",
    },
    transmission: {
      type: String,
      required: true,
      enum: ["Manual", "Automatic"],
      default: "Manual",
    },
    variant: { type: String, trim: true, default: "" },
    registration_number: { type: String, trim: true, default: "" },
    ownership_count: { type: Number, default: 1, min: 1 },
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
      enum: ["Available", "Sold", "Pending"],
      default: "Available",
    },
    slug: { type: String, required: true, unique: true, index: true },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compiling the model in serverless environment
export const Car: Model<ICar> =
  mongoose.models.Car || mongoose.model<ICar>("Car", CarSchema);
