import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  CarFront,
  Plus,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  ArrowUpRight,
  ExternalLink,
  Sparkles,
  Database,
  Cloud,
} from "lucide-react";
import {
  fetchCars,
  createCar,
  updateCar,
  deleteCar,
  checkBackendHealth,
  type CarItem,
} from "@/services/carService";
import { formatPrice } from "@/data/cars";
import { CarFormModal } from "@/components/admin/CarFormModal";
import { DeleteCarDialog } from "@/components/admin/DeleteCarDialog";

export default function AdminPanel() {
  const [cars, setCars] = useState<CarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Backend & DB Health
  const [health, setHealth] = useState<{
    connected: boolean;
    database: string;
    cloudinary: string;
  }>({
    connected: false,
    database: "checking",
    cloudinary: "checking",
  });

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Available" | "Sold">("All");

  // Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [carToEdit, setCarToEdit] = useState<CarItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");

  // Delete Dialog state
  const [carToDelete, setCarToDelete] = useState<CarItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Load cars and check health
  const checkStatusAndLoad = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setError(null);

    try {
      const h = await checkBackendHealth();
      setHealth(h);

      const data = await fetchCars();
      setCars(data);
    } catch (err: unknown) {
      console.error("Failed to load inventory:", err);
      const msg = err instanceof Error ? err.message : "Failed to load cars from MongoDB Atlas.";
      setError(msg);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    checkStatusAndLoad();
  }, []);

  // Flash success message helper
  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4500);
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = cars.length;
    const available = cars.filter((c) => c.status === "Available").length;
    const sold = cars.filter((c) => c.status === "Sold").length;
    return { total, available, sold };
  }, [cars]);

  // Filtered cars
  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      const matchQuery =
        `${car.brand} ${car.model} ${car.variant} ${car.registrationNumber || ""}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === "All" ? true : car.status.toLowerCase() === statusFilter.toLowerCase();
      return matchQuery && matchStatus;
    });
  }, [cars, searchQuery, statusFilter]);

  // Handlers
  const handleOpenAdd = () => {
    setCarToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (car: CarItem) => {
    setCarToEdit(car);
    setIsFormOpen(true);
  };

  const handleSaveCar = async (formData: {
    carData: Omit<CarItem, "id" | "images" | "slug">;
    existingImages: string[];
    newImageFiles: File[];
  }) => {
    setIsSaving(true);
    setProgressMessage("Starting save operation...");
    try {
      if (carToEdit) {
        await updateCar(
          carToEdit,
          formData.carData,
          formData.existingImages,
          formData.newImageFiles,
          (msg) => setProgressMessage(msg)
        );
        showSuccess(`Successfully updated ${formData.carData.brand} ${formData.carData.model}.`);
      } else {
        await createCar(formData.carData, formData.newImageFiles, (msg) =>
          setProgressMessage(msg)
        );
        showSuccess(
          `Successfully added ${formData.carData.brand} ${formData.carData.model} to MongoDB Atlas.`
        );
      }

      setIsFormOpen(false);
      setCarToEdit(null);
      await checkStatusAndLoad(true);
    } finally {
      setIsSaving(false);
      setProgressMessage("");
    }
  };

  const handleConfirmDelete = async () => {
    if (!carToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteCar(carToDelete);
      showSuccess(
        `Deleted ${carToDelete.brand} ${carToDelete.model} and cleaned up Cloudinary photos.`
      );
      setCarToDelete(null);
      await checkStatusAndLoad(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete car.";
      setDeleteError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (car: CarItem) => {
    const nextStatus = car.status === "Available" ? "Sold" : "Available";
    try {
      await updateCar(car, { status: nextStatus }, car.images, []);
      showSuccess(`Marked ${car.brand} ${car.model} as ${nextStatus}.`);
      await checkStatusAndLoad(true);
    } catch (err) {
      console.error("Status toggle error:", err);
    }
  };

  const isDbReady = health.database === "connected";
  const isCloudinaryReady = health.cloudinary === "configured";

  return (
    <div className="min-h-screen bg-ink-950 text-white pb-20 pt-24 sm:pt-28">
      {/* Top Bar / Navigation */}
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-2 w-2 rounded-full bg-gold-400"></span>
              <p className="eyebrow !text-gold-400">MongoDB & Cloudinary Car Management</p>
            </div>
            <h1 className="display text-2xl sm:text-4xl font-medium tracking-tight">
              Himalyan Wheels — Car Management
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/cars"
              target="_blank"
              className="flex items-center gap-1.5 border border-white/15 px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white/70 hover:border-gold-400 hover:text-gold-300 transition"
            >
              Public Website <ArrowUpRight size={14} />
            </Link>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-gold-400 hover:bg-gold-300 text-ink-950 px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-gold-400/20"
            >
              <Plus size={16} strokeWidth={2.5} /> Add New Car
            </button>
          </div>
        </div>

        {/* Security & Access Notice */}
        <div className="mt-6 flex items-start gap-3 border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-200/90">
          <ShieldAlert size={18} className="shrink-0 text-amber-400 mt-0.5" />
          <div className="leading-relaxed">
            <p className="font-semibold text-amber-300">Public Write Access Active (No-Login Mode)</p>
            <p className="mt-0.5 text-white/60">
              As requested, this admin panel is intentionally accessible without authentication. Anyone who has
              this URL can create, edit, and delete car listings. Private MongoDB credentials and Cloudinary API secrets
              remain exclusively on the Node.js backend.
            </p>
          </div>
        </div>

        {/* MongoDB & Cloudinary Status Cards */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div
            className={`flex items-center justify-between p-3.5 border ${
              isDbReady
                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300"
                : "bg-red-500/5 border-red-500/20 text-red-300"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Database size={17} className={isDbReady ? "text-emerald-400" : "text-red-400"} />
              <div>
                <p className="font-semibold">MongoDB Atlas Database</p>
                <p className="text-[10px] text-white/50">
                  {isDbReady ? "Connected & storing inventory" : "Disconnected / MONGODB_URI required"}
                </p>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded-full border ${
                isDbReady
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  : "bg-red-500/20 border-red-500/40 text-red-300"
              }`}
            >
              {health.database}
            </span>
          </div>

          <div
            className={`flex items-center justify-between p-3.5 border ${
              isCloudinaryReady
                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300"
                : "bg-amber-500/5 border-amber-500/20 text-amber-300"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Cloud size={17} className={isCloudinaryReady ? "text-emerald-400" : "text-amber-400"} />
              <div>
                <p className="font-semibold">Cloudinary Photo Storage</p>
                <p className="text-[10px] text-white/50">
                  {isCloudinaryReady
                    ? "Configured & hosting car photos"
                    : "Not configured / Keys required"}
                </p>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded-full border ${
                isCloudinaryReady
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  : "bg-amber-500/20 border-amber-500/40 text-amber-300"
              }`}
            >
              {health.cloudinary}
            </span>
          </div>
        </div>

        {/* Configuration Notice if not connected */}
        {(!isDbReady || !isCloudinaryReady) && (
          <div className="mt-4 flex items-start gap-3 border border-blue-500/30 bg-blue-500/10 p-5 text-xs text-blue-200">
            <Database size={20} className="shrink-0 text-blue-400 mt-0.5" />
            <div className="space-y-1.5 leading-relaxed">
              <p className="font-semibold text-blue-300 text-sm">
                Environment Configuration Required
              </p>
              <p className="text-white/80">
                To connect your persistent MongoDB Atlas database and Cloudinary storage, set these variables
                in your <code className="bg-ink-900 px-1.5 py-0.5 rounded text-gold-300">.env</code> file (or Vercel Project Settings):
              </p>
              <div className="bg-ink-950/80 p-3 rounded font-mono text-[11px] text-white/90 border border-white/10 space-y-1">
                <div>MONGODB_URI=mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster0.mongodb.net/himalyanwheels</div>
                <div>CLOUDINARY_CLOUD_NAME=your_cloud_name</div>
                <div>CLOUDINARY_API_KEY=your_api_key</div>
                <div>CLOUDINARY_API_SECRET=your_api_secret</div>
              </div>
            </div>
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div className="mt-4 flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 animate-fade-in">
            <CheckCircle size={17} className="shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Metric Overview Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-white/10 bg-ink-900 p-5">
            <p className="text-[10px] uppercase tracking-wider text-white/40">Total Inventory</p>
            <p className="display text-3xl font-medium text-white mt-2">{metrics.total}</p>
            <p className="text-[11px] text-white/40 mt-1">Total cars in MongoDB Atlas</p>
          </div>

          <div className="border border-white/10 bg-ink-900 p-5">
            <p className="text-[10px] uppercase tracking-wider text-emerald-400">Available For Sale</p>
            <p className="display text-3xl font-medium text-emerald-400 mt-2">{metrics.available}</p>
            <p className="text-[11px] text-white/40 mt-1">Live on public website</p>
          </div>

          <div className="border border-white/10 bg-ink-900 p-5">
            <p className="text-[10px] uppercase tracking-wider text-white/40">Sold Cars</p>
            <p className="display text-3xl font-medium text-white/60 mt-2">{metrics.sold}</p>
            <p className="text-[11px] text-white/40 mt-1">Marked as sold</p>
          </div>
        </div>

        {/* Controls: Search, Filter, Refresh */}
        <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border border-white/10 bg-ink-900 p-3">
          <div className="flex flex-1 items-center gap-3 px-3">
            <Search size={16} className="text-white/35 shrink-0" />
            <input
              type="text"
              placeholder="Search by brand, model, variant, or registration..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/30"
            />
          </div>

          <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-4">
            <div className="flex items-center gap-1 bg-ink-950 p-1 border border-white/10">
              {(["All", "Available", "Sold"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 text-[11px] font-semibold transition ${
                    statusFilter === filter
                      ? "bg-gold-400 text-ink-950"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <button
              onClick={() => checkStatusAndLoad(false)}
              disabled={loading}
              title="Refresh inventory"
              className="p-2 text-white/60 hover:text-white border border-white/10 bg-ink-950 transition hover:border-gold-400"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Content Area: Table / Cards */}
        <div className="mt-6">
          {loading ? (
            <div className="border border-white/10 bg-ink-900 p-16 text-center">
              <RefreshCw size={28} className="mx-auto text-gold-400 animate-spin" />
              <p className="mt-4 text-sm text-white/60">Loading inventory from MongoDB Atlas...</p>
            </div>
          ) : error ? (
            <div className="border border-red-500/20 bg-red-950/20 p-12 text-center">
              <AlertCircle size={32} className="mx-auto text-red-400" />
              <h3 className="display text-lg text-white mt-3">Unable to Load Inventory</h3>
              <p className="text-xs text-red-300/80 mt-1 max-w-md mx-auto">{error}</p>
              <button
                onClick={() => checkStatusAndLoad(false)}
                className="mt-5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition"
              >
                Try Again
              </button>
            </div>
          ) : filteredCars.length === 0 ? (
            <div className="border border-white/10 bg-ink-900 py-16 px-6 text-center">
              <CarFront size={40} className="mx-auto text-gold-400/80" />
              <h3 className="display text-xl text-white mt-4">
                {searchQuery || statusFilter !== "All"
                  ? "No matching vehicles found"
                  : "No cars in MongoDB Atlas yet"}
              </h3>
              <p className="text-xs text-white/50 mt-1 max-w-sm mx-auto">
                {searchQuery || statusFilter !== "All"
                  ? "Try clearing your search query or switching your status filter."
                  : "Click 'Add New Car' above to add your first vehicle listing with full details and Cloudinary photos."}
              </p>
              {!(searchQuery || statusFilter !== "All") && (
                <button
                  onClick={handleOpenAdd}
                  className="mt-6 inline-flex items-center gap-2 bg-gold-400 hover:bg-gold-300 text-ink-950 px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition"
                >
                  <Plus size={15} /> Add First Car
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop / Tablet Table View */}
              <div className="hidden md:block border border-white/10 bg-ink-900 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 bg-ink-950 text-[10px] uppercase tracking-wider text-white/40">
                    <tr>
                      <th className="py-3.5 px-4">Vehicle</th>
                      <th className="py-3.5 px-4">Price</th>
                      <th className="py-3.5 px-4">Year & Specs</th>
                      <th className="py-3.5 px-4">Driven</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Featured</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredCars.map((car) => (
                      <tr key={car.id} className="hover:bg-white/[0.02] transition">
                        {/* Vehicle & Thumbnail */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-12 bg-ink-950 border border-white/10 overflow-hidden shrink-0 relative">
                              {car.images && car.images[0] ? (
                                <img
                                  src={car.images[0]}
                                  alt={`${car.brand} ${car.model}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[9px] text-white/30">
                                  No photo
                                </div>
                              )}
                              {car.images.length > 1 && (
                                <span className="absolute bottom-0 right-0 bg-black/75 px-1 text-[8px] text-white">
                                  +{car.images.length - 1}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] uppercase tracking-wider text-gold-400">
                                {car.brand}
                              </p>
                              <p className="display text-sm font-medium text-white truncate">
                                {car.model}{" "}
                                {car.variant && (
                                  <span className="text-white/50 font-normal">
                                    {car.variant}
                                  </span>
                                )}
                              </p>
                              {car.registrationNumber && (
                                <p className="text-[10px] text-white/40 font-mono">
                                  {car.registrationNumber}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4 font-semibold text-white">
                          <div>{formatPrice(car.price)}</div>
                          <div className="text-[10px] text-white/40 font-normal">
                            ₹{car.price.toLocaleString("en-IN")}
                          </div>
                        </td>

                        {/* Specs */}
                        <td className="py-3.5 px-4 text-white/70">
                          <div>
                            {car.year} · {car.fuel}
                          </div>
                          <div className="text-[10px] text-white/40">{car.transmission}</div>
                        </td>

                        {/* Driven */}
                        <td className="py-3.5 px-4 text-white/70">
                          {car.kmDriven.toLocaleString("en-IN")} km
                        </td>

                        {/* Status Toggle */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(car)}
                            title="Click to toggle Available / Sold"
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border transition ${
                              car.status === "Available"
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                                : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                car.status === "Available" ? "bg-emerald-400" : "bg-zinc-400"
                              }`}
                            ></span>
                            {car.status}
                          </button>
                        </td>

                        {/* Featured */}
                        <td className="py-3.5 px-4">
                          {car.featured ? (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-gold-400">
                              <Sparkles size={12} /> Yes
                            </span>
                          ) : (
                            <span className="text-[10px] text-white/30">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/cars/${car.slug}`}
                              target="_blank"
                              title="View on public site"
                              className="p-1.5 text-white/40 hover:text-white transition"
                            >
                              <ExternalLink size={14} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(car)}
                              title="Edit Car"
                              className="p-1.5 text-white/60 hover:text-gold-300 border border-white/10 hover:border-gold-400/50 bg-ink-950 transition"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCarToDelete(car);
                                setDeleteError(null);
                              }}
                              title="Delete Car"
                              className="p-1.5 text-white/60 hover:text-red-400 border border-white/10 hover:border-red-500/50 bg-ink-950 transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {filteredCars.map((car) => (
                  <div key={car.id} className="border border-white/10 bg-ink-900 p-4">
                    <div className="flex gap-3">
                      <div className="w-20 h-16 bg-ink-950 border border-white/10 overflow-hidden shrink-0 relative">
                        {car.images && car.images[0] ? (
                          <img
                            src={car.images[0]}
                            alt={`${car.brand} ${car.model}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-white/30">
                            No photo
                          </div>
                        )}
                        {car.images.length > 1 && (
                          <span className="absolute bottom-0 right-0 bg-black/80 px-1 text-[8px] text-white">
                            +{car.images.length - 1}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-gold-400">
                              {car.brand}
                            </p>
                            <h3 className="display text-sm font-semibold text-white truncate">
                              {car.model} {car.variant && `(${car.variant})`}
                            </h3>
                          </div>
                          <p className="text-xs font-bold text-white shrink-0">
                            {formatPrice(car.price)}
                          </p>
                        </div>
                        <p className="text-[10px] text-white/50 mt-1">
                          {car.year} · {car.fuel} · {car.kmDriven.toLocaleString("en-IN")} km
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(car)}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border ${
                          car.status === "Available"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-zinc-800 border-zinc-700 text-zinc-400"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            car.status === "Available" ? "bg-emerald-400" : "bg-zinc-400"
                          }`}
                        ></span>
                        {car.status}
                      </button>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/cars/${car.slug}`}
                          target="_blank"
                          className="px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/50 border border-white/10"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(car)}
                          className="flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase tracking-wider text-gold-400 border border-gold-400/40"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCarToDelete(car);
                            setDeleteError(null);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase tracking-wider text-red-400 border border-red-500/40"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      <CarFormModal
        isOpen={isFormOpen}
        carToEdit={carToEdit}
        isSaving={isSaving}
        progressMessage={progressMessage}
        onClose={() => {
          if (!isSaving) {
            setIsFormOpen(false);
            setCarToEdit(null);
          }
        }}
        onSubmit={handleSaveCar}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteCarDialog
        isOpen={Boolean(carToDelete)}
        car={carToDelete}
        isDeleting={isDeleting}
        error={deleteError}
        onClose={() => {
          if (!isDeleting) {
            setCarToDelete(null);
            setDeleteError(null);
          }
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
