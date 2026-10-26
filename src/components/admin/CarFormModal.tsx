import { useState, useEffect, useRef } from "react";
import type { FC, FormEvent, ChangeEvent } from "react";
import { X, Upload, Check, Loader2 } from "lucide-react";
import type { CarItem } from "@/services/carService";
import { validateImageFile } from "@/services/carService";

interface CarFormModalProps {
  isOpen: boolean;
  carToEdit: CarItem | null;
  isSaving: boolean;
  progressMessage: string;
  onClose: () => void;
  onSubmit: (formData: {
    carData: Omit<CarItem, "id" | "images" | "slug">;
    existingImages: string[];
    newImageFiles: File[];
  }) => Promise<void>;
}

const COMMON_FEATURES = [
  "Panoramic Sunroof",
  "Sunroof",
  "4x4 Drive",
  "Touchscreen Infotainment",
  "Apple CarPlay & Android Auto",
  "Cruise Control",
  "Rear Camera",
  "360 Degree Camera",
  "Alloy Wheels",
  "Push Button Start",
  "Hill Hold Assist",
  "Wireless Charging",
  "Leather Interiors",
  "Automatic Climate Control",
  "LED Headlamps",
  "Ventilated Seats",
];

const FUEL_TYPES = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"];
const TRANSMISSION_TYPES = ["Manual", "Automatic"];
const STATUS_OPTIONS = ["Available", "Sold"];

export const CarFormModal: FC<CarFormModalProps> = ({
  isOpen,
  carToEdit,
  isSaving,
  progressMessage,
  onClose,
  onSubmit,
}) => {
  const currentYear = new Date().getFullYear();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [variant, setVariant] = useState("");
  const [year, setYear] = useState<number | "">(currentYear);
  const [price, setPrice] = useState<number | "">("");
  const [kmDriven, setKmDriven] = useState<number | "">("");
  const [fuel, setFuel] = useState("Petrol");
  const [transmission, setTransmission] = useState("Manual");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [ownershipCount, setOwnershipCount] = useState<number | "">(1);
  const [colour, setColour] = useState("");
  const [registrationState, setRegistrationState] = useState("Himachal Pradesh");
  const [location, setLocation] = useState("Solan, HP");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeatureInput, setNewFeatureInput] = useState("");
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState("Available");

  // Images state
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newFilePreviews, setNewFilePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize or reset form when carToEdit changes
  useEffect(() => {
    if (carToEdit) {
      setBrand(carToEdit.brand || "");
      setModel(carToEdit.model || "");
      setVariant(carToEdit.variant || "");
      setYear(carToEdit.year || currentYear);
      setPrice(carToEdit.price || "");
      setKmDriven(carToEdit.kmDriven ?? 0);
      setFuel(carToEdit.fuel || "Petrol");
      setTransmission(carToEdit.transmission || "Manual");
      setRegistrationNumber(carToEdit.registrationNumber || "");
      setOwnershipCount(carToEdit.ownershipCount ?? 1);
      setColour(carToEdit.colour || "");
      setRegistrationState(carToEdit.registrationState || "Himachal Pradesh");
      setLocation(carToEdit.location || "Solan, HP");
      setDescription(carToEdit.description || "");
      setFeatures(carToEdit.features || []);
      setFeatured(Boolean(carToEdit.featured));
      setStatus(carToEdit.status || "Available");
      setExistingImages(carToEdit.images || []);
    } else {
      setBrand("");
      setModel("");
      setVariant("");
      setYear(currentYear);
      setPrice("");
      setKmDriven("");
      setFuel("Petrol");
      setTransmission("Manual");
      setRegistrationNumber("");
      setOwnershipCount(1);
      setColour("");
      setRegistrationState("Himachal Pradesh");
      setLocation("Solan, HP");
      setDescription("");
      setFeatures([]);
      setFeatured(false);
      setStatus("Available");
      setExistingImages([]);
    }
    setNewFiles([]);
    setNewFilePreviews([]);
    setErrors({});
    setFormError(null);
  }, [carToEdit, isOpen, currentYear]);

  // Clean up object URLs on unmount or preview changes
  useEffect(() => {
    return () => {
      newFilePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newFilePreviews]);

  if (!isOpen) return null;

  const handleFileSelection = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    const validFiles: File[] = [];
    const newPreviews: string[] = [];
    const validationErrors: string[] = [];

    for (const file of selectedFiles) {
      const check = validateImageFile(file);
      if (check.valid) {
        validFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      } else if (check.error) {
        validationErrors.push(check.error);
      }
    }

    if (validationErrors.length > 0) {
      setFormError(validationErrors[0]);
    } else {
      setFormError(null);
    }

    setNewFiles((prev) => [...prev, ...validFiles]);
    setNewFilePreviews((prev) => [...prev, ...newPreviews]);

    // Reset file input so user can choose the same file again if desired
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeExistingImage = (indexToRemove: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const removeNewFile = (indexToRemove: number) => {
    URL.revokeObjectURL(newFilePreviews[indexToRemove]);
    setNewFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
    setNewFilePreviews((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const toggleFeature = (featureName: string) => {
    if (features.includes(featureName)) {
      setFeatures(features.filter((f) => f !== featureName));
    } else {
      setFeatures([...features, featureName]);
    }
  };

  const handleAddCustomFeature = () => {
    const trimmed = newFeatureInput.trim();
    if (trimmed && !features.includes(trimmed)) {
      setFeatures([...features, trimmed]);
      setNewFeatureInput("");
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!brand.trim()) newErrors.brand = "Brand / car name is required";
    if (!model.trim()) newErrors.model = "Model is required";

    const numYear = Number(year);
    if (!year || isNaN(numYear) || numYear < 1980 || numYear > currentYear + 1) {
      newErrors.year = `Valid year required (1980 - ${currentYear + 1})`;
    }

    const numPrice = Number(price);
    if (!price || isNaN(numPrice) || numPrice <= 0) {
      newErrors.price = "Valid price in INR is required (> 0)";
    }

    const numKm = Number(kmDriven);
    if (kmDriven === "" || isNaN(numKm) || numKm < 0) {
      newErrors.kmDriven = "Valid kilometres driven required (>= 0)";
    }

    const totalImages = existingImages.length + newFiles.length;
    if (totalImages === 0) {
      newErrors.images = "At least one car photo is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) {
      setFormError("Please fill in all required fields accurately.");
      return;
    }

    try {
      await onSubmit({
        carData: {
          brand: brand.trim(),
          model: model.trim(),
          variant: variant.trim(),
          year: Number(year),
          price: Number(price),
          kmDriven: Number(kmDriven),
          fuel,
          transmission,
          registrationNumber: registrationNumber.trim(),
          ownershipCount: ownershipCount === "" ? undefined : Number(ownershipCount),
          colour: colour.trim(),
          registrationState: registrationState.trim(),
          location: location.trim(),
          description: description.trim(),
          features,
          featured,
          status,
        },
        existingImages,
        newImageFiles: newFiles,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save car. Please try again.";
      setFormError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div
        className="w-full max-w-4xl max-h-[92vh] overflow-y-auto border border-white/10 bg-ink-900 shadow-2xl relative flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-modal-title"
      >
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-ink-950/95 backdrop-blur px-6 py-4">
          <div>
            <p className="eyebrow">{carToEdit ? "Inventory Update" : "New Listing"}</p>
            <h2 id="form-modal-title" className="display text-xl font-medium text-white">
              {carToEdit ? `Edit Car: ${carToEdit.brand} ${carToEdit.model}` : "Add New Car"}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-white/50 hover:text-white p-2 transition disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-7 flex-1">
          {formError && (
            <div className="p-4 bg-red-950/60 border border-red-500/40 text-red-200 text-xs rounded">
              <p className="font-semibold mb-1">Attention Required:</p>
              <p>{formError}</p>
            </div>
          )}

          {/* Section 1: Required Car Details */}
          <div>
            <h3 className="eyebrow mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400"></span>
              Core Vehicle Information <span className="text-red-400">*</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5">
                  Brand / Make <span className="text-gold-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hyundai, Toyota, Mahindra"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className={`w-full bg-ink-950 border px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-gold-400 ${
                    errors.brand ? "border-red-500" : "border-white/10"
                  }`}
                />
                {errors.brand && <p className="text-[11px] text-red-400 mt-1">{errors.brand}</p>}
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5">
                  Model <span className="text-gold-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Creta, Fortuner, Thar"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className={`w-full bg-ink-950 border px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-gold-400 ${
                    errors.model ? "border-red-500" : "border-white/10"
                  }`}
                />
                {errors.model && <p className="text-[11px] text-red-400 mt-1">{errors.model}</p>}
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5">
                  Variant (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. SX, LX Hard Top, ZXi"
                  value={variant}
                  onChange={(e) => setVariant(e.target.value)}
                  className="w-full bg-ink-950 border border-white/10 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-gold-400"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5">
                  Manufacturing Year <span className="text-gold-400">*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 2022"
                  min={1980}
                  max={currentYear + 1}
                  value={year}
                  onChange={(e) => setYear(e.target.value === "" ? "" : Number(e.target.value))}
                  className={`w-full bg-ink-950 border px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-gold-400 ${
                    errors.year ? "border-red-500" : "border-white/10"
                  }`}
                />
                {errors.year && <p className="text-[11px] text-red-400 mt-1">{errors.year}</p>}
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5">
                  Selling Price (₹ INR) <span className="text-gold-400">*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 950000"
                  min={1}
                  value={price}
                  onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  className={`w-full bg-ink-950 border px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-gold-400 ${
                    errors.price ? "border-red-500" : "border-white/10"
                  }`}
                />
                {errors.price && <p className="text-[11px] text-red-400 mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5">
                  Kilometres Driven <span className="text-gold-400">*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 35000"
                  min={0}
                  value={kmDriven}
                  onChange={(e) => setKmDriven(e.target.value === "" ? "" : Number(e.target.value))}
                  className={`w-full bg-ink-950 border px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-gold-400 ${
                    errors.kmDriven ? "border-red-500" : "border-white/10"
                  }`}
                />
                {errors.kmDriven && <p className="text-[11px] text-red-400 mt-1">{errors.kmDriven}</p>}
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5">
                  Fuel Type <span className="text-gold-400">*</span>
                </label>
                <select
                  value={fuel}
                  onChange={(e) => setFuel(e.target.value)}
                  className="w-full bg-ink-950 border border-white/10 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-gold-400 cursor-pointer"
                >
                  {FUEL_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-ink-900 text-white">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5">
                  Transmission <span className="text-gold-400">*</span>
                </label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  className="w-full bg-ink-950 border border-white/10 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-gold-400 cursor-pointer"
                >
                  {TRANSMISSION_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-ink-900 text-white">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5">
                  Inventory Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-ink-950 border border-white/10 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-gold-400 cursor-pointer"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} className="bg-ink-900 text-white">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Photos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="eyebrow flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-400"></span>
                Vehicle Photos <span className="text-gold-400">*</span>
              </h3>
              <span className="text-[10px] text-white/40">
                JPEG, PNG, WebP · Max 5MB per image
              </span>
            </div>

            {/* Upload Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 hover:border-gold-400/70 bg-ink-950 p-6 text-center cursor-pointer transition group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleFileSelection}
                className="hidden"
              />
              <Upload
                size={26}
                className="mx-auto text-gold-400 group-hover:scale-110 transition duration-300"
              />
              <p className="mt-2 text-xs font-semibold text-white">
                Click to browse or drag & drop multiple car photos
              </p>
              <p className="text-[10px] text-white/40 mt-1">
                Upload clear front, rear, side, and interior pictures of the car
              </p>
            </div>
            {errors.images && <p className="text-[11px] text-red-400 mt-1.5">{errors.images}</p>}

            {/* Photo Previews */}
            {(existingImages.length > 0 || newFilePreviews.length > 0) && (
              <div className="mt-4">
                <p className="text-[10px] uppercase tracking-wider text-white/45 mb-2">
                  Photos ({existingImages.length + newFilePreviews.length} total) — Click ✕ on any
                  photo to remove
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {/* Existing photos */}
                  {existingImages.map((url, idx) => (
                    <div
                      key={`existing-${idx}`}
                      className="group relative aspect-[4/3] border border-white/15 bg-ink-950 overflow-hidden"
                    >
                      <img
                        src={url}
                        alt={`Existing car photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 left-1 bg-black/70 px-1.5 py-0.5 text-[8px] text-white/70">
                        Saved
                      </span>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        className="absolute top-1 right-1 bg-red-600/90 hover:bg-red-500 text-white p-1 rounded-full opacity-80 group-hover:opacity-100 transition shadow"
                        title="Remove photo"
                        aria-label="Remove photo"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  {/* New pending photo previews */}
                  {newFilePreviews.map((previewUrl, idx) => (
                    <div
                      key={`new-${idx}`}
                      className="group relative aspect-[4/3] border-2 border-gold-400/60 bg-ink-950 overflow-hidden"
                    >
                      <img
                        src={previewUrl}
                        alt={`New upload preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 left-1 bg-gold-400 px-1.5 py-0.5 text-[8px] font-bold text-ink-950">
                        New
                      </span>
                      <button
                        type="button"
                        onClick={() => removeNewFile(idx)}
                        className="absolute top-1 right-1 bg-red-600/90 hover:bg-red-500 text-white p-1 rounded-full opacity-80 group-hover:opacity-100 transition shadow"
                        title="Remove photo"
                        aria-label="Remove photo"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Optional Vehicle Specifications */}
          <div>
            <h3 className="eyebrow mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
              Registration & Additional Details (Optional)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5">
                  Registration Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. HP 14 A 1234"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                  className="w-full bg-ink-950 border border-white/10 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-gold-400 uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5">
                  Ownership
                </label>
                <select
                  value={ownershipCount}
                  onChange={(e) =>
                    setOwnershipCount(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="w-full bg-ink-950 border border-white/10 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-gold-400 cursor-pointer"
                >
                  <option value={1}>1st Owner</option>
                  <option value={2}>2nd Owner</option>
                  <option value={3}>3rd Owner</option>
                  <option value={4}>4th+ Owner</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5">
                  Colour
                </label>
                <input
                  type="text"
                  placeholder="e.g. Polar White, Grey"
                  value={colour}
                  onChange={(e) => setColour(e.target.value)}
                  className="w-full bg-ink-950 border border-white/10 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-gold-400"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5">
                  Location / State
                </label>
                <input
                  type="text"
                  placeholder="e.g. Solan, HP"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-ink-950 border border-white/10 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-gold-400"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Description */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Add key highlights about vehicle condition, service history, mountain performance, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-ink-950 border border-white/10 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-gold-400 resize-none"
            />
          </div>

          {/* Section 5: Features Chips */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-2">
              Key Features & Equipment
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {COMMON_FEATURES.map((feat) => {
                const isSelected = features.includes(feat);
                return (
                  <button
                    key={feat}
                    type="button"
                    onClick={() => toggleFeature(feat)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs transition border ${
                      isSelected
                        ? "bg-gold-400/20 border-gold-400 text-gold-300"
                        : "bg-ink-950 border-white/10 text-white/60 hover:border-white/30"
                    }`}
                  >
                    {isSelected && <Check size={12} className="text-gold-400" />}
                    {feat}
                  </button>
                );
              })}
            </div>

            {/* Custom feature input */}
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                placeholder="Add other custom feature..."
                value={newFeatureInput}
                onChange={(e) => setNewFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomFeature();
                  }
                }}
                className="flex-1 bg-ink-950 border border-white/10 px-3 py-1.5 text-xs text-white outline-none focus:border-gold-400"
              />
              <button
                type="button"
                onClick={handleAddCustomFeature}
                className="px-3 py-1.5 text-xs bg-ink-800 border border-white/15 text-white hover:border-gold-400 transition"
              >
                Add
              </button>
            </div>
          </div>

          {/* Section 6: Featured Toggle */}
          <div className="pt-2 border-t border-white/10">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-gold-400 rounded cursor-pointer"
              />
              <div>
                <p className="text-xs font-semibold text-white">Featured Car on Homepage</p>
                <p className="text-[10px] text-white/50">
                  Highlight this vehicle on the Himalyan Wheels homepage showcase collection.
                </p>
              </div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-ink-950/95 backdrop-blur border-t border-white/10 py-4 -mx-6 px-6 flex items-center justify-between">
            <div>
              {isSaving && (
                <div className="flex items-center gap-2 text-xs text-gold-400">
                  <Loader2 size={15} className="animate-spin" />
                  <span>{progressMessage || "Processing..."}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white/70 hover:text-white border border-white/15 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-ink-950 bg-gold-400 hover:bg-gold-300 transition disabled:opacity-50 shadow-lg shadow-gold-400/20"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Saving...
                  </>
                ) : carToEdit ? (
                  "Save Changes"
                ) : (
                  "Add Car"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
