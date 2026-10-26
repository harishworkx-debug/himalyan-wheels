export interface ICloudinaryImage {
  url: string;
  public_id: string;
}

export interface CarItem {
  id: string;
  slug: string;
  brand: string;
  name?: string;
  model: string;
  variant: string;
  year: number;
  price: number;
  kmDriven: number;
  fuel: "Diesel" | "Petrol" | "CNG" | "Electric" | "Hybrid" | string;
  transmission: "Manual" | "Automatic" | string;
  bodyType?: string;
  location?: string;
  description: string;
  features: string[];
  images: string[];
  imageMetadata?: ICloudinaryImage[];
  featured: boolean;
  status: "Available" | "Sold" | string;
  registrationNumber?: string;
  ownershipCount?: number;
  colour?: string;
  registrationState?: string;
  createdAt?: string;
  updatedAt?: string;
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/$/, "");

export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return API_BASE ? `${API_BASE}${cleanEndpoint}` : cleanEndpoint;
}

/**
 * Maps MongoDB document to standard CarItem
 */
export function mapMongoToCar(doc: any): CarItem {
  const brand = doc.brand || doc.name || "Unknown";
  const rawImages: ICloudinaryImage[] = Array.isArray(doc.images) ? doc.images : [];
  const imageUrls: string[] =
    Array.isArray(doc.image_urls) && doc.image_urls.length > 0
      ? doc.image_urls
      : rawImages.map((i) => i.url).filter(Boolean);

  return {
    id: String(doc._id || doc.id),
    slug: doc.slug || `${brand.toLowerCase()}-${doc.model.toLowerCase()}-${String(doc._id).slice(-6)}`,
    brand: brand,
    name: doc.name || `${brand} ${doc.model}`,
    model: doc.model,
    variant: doc.variant || "",
    year: Number(doc.year),
    price: Number(doc.price),
    kmDriven: Number(doc.kilometres_driven ?? doc.kmDriven ?? 0),
    fuel: doc.fuel_type || doc.fuel || "Petrol",
    transmission: doc.transmission || "Manual",
    bodyType: "SUV",
    location: doc.location || "Solan, HP",
    description: doc.description || "",
    features: Array.isArray(doc.features) ? doc.features : [],
    images: imageUrls,
    imageMetadata: rawImages,
    featured: Boolean(doc.featured),
    status: doc.status || "Available",
    registrationNumber: doc.registration_number || "",
    ownershipCount: doc.ownership_count ?? undefined,
    colour: doc.colour || "",
    registrationState: doc.registration_state || "",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/**
 * Validates image file type and size (<= 5MB)
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `File "${file.name}" is not a supported format. Please use JPEG, PNG, or WebP.`,
    };
  }

  const maxBytes = 5 * 1024 * 1024; // 5 MB
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File "${file.name}" exceeds 5 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
    };
  }

  return { valid: true };
}

/**
 * Read File as Data URI for upload
 */
function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Upload a single image to Cloudinary via backend endpoint
 */
export async function uploadImageToCloudinary(file: File): Promise<ICloudinaryImage> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const dataUri = await fileToDataUri(file);
  const response = await fetch(getApiUrl("/api/upload"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image: dataUri }),
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || `Failed to upload image "${file.name}" to Cloudinary.`);
  }

  return {
    url: result.data.url,
    public_id: result.data.public_id,
  };
}

/**
 * Check backend connection status and health
 */
export async function checkBackendHealth(): Promise<{
  connected: boolean;
  database: string;
  cloudinary: string;
}> {
  try {
    const res = await fetch(getApiUrl("/api/health"));
    if (!res.ok) {
      return { connected: false, database: "unreachable", cloudinary: "unreachable" };
    }
    const data = await res.json();
    return {
      connected: true,
      database: data.database,
      cloudinary: data.cloudinary,
    };
  } catch {
    return { connected: false, database: "unreachable", cloudinary: "unreachable" };
  }
}

/**
 * Fetch all cars from MongoDB
 */
export async function fetchCars(options?: {
  onlyAvailable?: boolean;
  onlyFeatured?: boolean;
}): Promise<CarItem[]> {
  const params = new URLSearchParams();
  if (options?.onlyAvailable) params.append("status", "Available");
  if (options?.onlyFeatured) params.append("featured", "true");

  const url = `${getApiUrl("/api/cars")}${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch cars: ${response.statusText}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || "Failed to load cars from MongoDB Atlas.");
  }

  return (result.data || []).map(mapMongoToCar);
}

/**
 * Fetch a single car by slug or ID
 */
export async function fetchCarBySlug(slugOrId: string): Promise<CarItem | null> {
  if (!slugOrId) return null;

  try {
    const response = await fetch(getApiUrl(`/api/cars/${encodeURIComponent(slugOrId)}`));
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch car: ${response.statusText}`);
    }

    const result = await response.json();
    if (!result.success || !result.data) return null;

    return mapMongoToCar(result.data);
  } catch (err) {
    console.warn("fetchCarBySlug error:", err);
    return null;
  }
}

/**
 * Create a new car in MongoDB with Cloudinary photos
 */
export async function createCar(
  carData: Omit<CarItem, "id" | "images" | "slug">,
  imageFiles: File[],
  onProgress?: (progressMessage: string) => void
): Promise<CarItem> {
  const uploadedCloudinaryImages: ICloudinaryImage[] = [];

  try {
    // 1. Upload photos to Cloudinary
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      if (onProgress) {
        onProgress(`Uploading photo ${i + 1} of ${imageFiles.length} to Cloudinary...`);
      }
      const uploaded = await uploadImageToCloudinary(file);
      uploadedCloudinaryImages.push(uploaded);
    }

    if (onProgress) {
      onProgress("Saving vehicle record in MongoDB Atlas...");
    }

    // 2. Save in MongoDB Atlas
    const payload = {
      name: carData.brand,
      brand: carData.brand,
      model: carData.model,
      variant: carData.variant || "",
      year: carData.year,
      price: carData.price,
      kilometres_driven: carData.kmDriven,
      fuel_type: carData.fuel,
      transmission: carData.transmission,
      registration_number: carData.registrationNumber || "",
      ownership_count: carData.ownershipCount ?? 1,
      colour: carData.colour || "",
      registration_state: carData.registrationState || "Himachal Pradesh",
      location: carData.location || "Solan, HP",
      description: carData.description || "",
      features: carData.features || [],
      images: uploadedCloudinaryImages,
      featured: Boolean(carData.featured),
      status: carData.status || "Available",
    };

    const response = await fetch(getApiUrl("/api/cars"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to create car in MongoDB Atlas.");
    }

    return mapMongoToCar(result.data);
  } catch (error: any) {
    console.error("createCar error:", error);
    throw new Error(error.message || "Failed to save car.");
  }
}

/**
 * Update an existing car in MongoDB
 */
export async function updateCar(
  car: CarItem,
  updatedFields: Partial<CarItem>,
  remainingExistingImages: string[],
  newImageFiles: File[],
  onProgress?: (progressMessage: string) => void
): Promise<CarItem> {
  try {
    // 1. Preserve existing image metadata for retained URLs
    const existingMeta = car.imageMetadata || [];
    const keptImages: ICloudinaryImage[] = [];

    for (const url of remainingExistingImages) {
      const meta = existingMeta.find((m) => m.url === url);
      if (meta) {
        keptImages.push(meta);
      } else {
        // Fallback for sample/external URLs
        keptImages.push({ url, public_id: "" });
      }
    }

    // 2. Upload any new photos to Cloudinary
    const newlyUploaded: ICloudinaryImage[] = [];
    for (let i = 0; i < newImageFiles.length; i++) {
      const file = newImageFiles[i];
      if (onProgress) {
        onProgress(`Uploading new photo ${i + 1} of ${newImageFiles.length} to Cloudinary...`);
      }
      const uploaded = await uploadImageToCloudinary(file);
      newlyUploaded.push(uploaded);
    }

    if (onProgress) {
      onProgress("Updating MongoDB record...");
    }

    const finalImages = [...keptImages, ...newlyUploaded];

    const payload = {
      name: updatedFields.brand ?? car.brand,
      brand: updatedFields.brand ?? car.brand,
      model: updatedFields.model ?? car.model,
      variant: updatedFields.variant !== undefined ? updatedFields.variant : car.variant,
      year: updatedFields.year ?? car.year,
      price: updatedFields.price ?? car.price,
      kilometres_driven: updatedFields.kmDriven ?? car.kmDriven,
      fuel_type: updatedFields.fuel ?? car.fuel,
      transmission: updatedFields.transmission ?? car.transmission,
      registration_number: updatedFields.registrationNumber !== undefined ? updatedFields.registrationNumber : car.registrationNumber,
      ownership_count: updatedFields.ownershipCount !== undefined ? updatedFields.ownershipCount : car.ownershipCount,
      colour: updatedFields.colour !== undefined ? updatedFields.colour : car.colour,
      registration_state: updatedFields.registrationState !== undefined ? updatedFields.registrationState : car.registrationState,
      location: updatedFields.location ?? car.location,
      description: updatedFields.description !== undefined ? updatedFields.description : car.description,
      features: updatedFields.features ?? car.features,
      featured: updatedFields.featured !== undefined ? updatedFields.featured : car.featured,
      status: updatedFields.status ?? car.status,
      images: finalImages,
    };

    const response = await fetch(getApiUrl(`/api/cars/${car.id}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to update car in MongoDB Atlas.");
    }

    return mapMongoToCar(result.data);
  } catch (error: any) {
    console.error("updateCar error:", error);
    throw new Error(error.message || "Failed to update car.");
  }
}

/**
 * Delete a car from MongoDB and clean up its Cloudinary images
 */
export async function deleteCar(car: CarItem): Promise<void> {
  const response = await fetch(getApiUrl(`/api/cars/${car.id}`), {
    method: "DELETE",
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to delete car from MongoDB.");
  }
}
