import type { FC } from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import type { CarItem } from "@/services/carService";
import { formatPrice } from "@/data/cars";

interface DeleteCarDialogProps {
  car: CarItem | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
  error?: string | null;
}

export const DeleteCarDialog: FC<DeleteCarDialogProps> = ({
  car,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
  error,
}) => {
  if (!isOpen || !car) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md border border-white/10 bg-ink-900 p-6 shadow-2xl relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition p-1"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4 text-red-400">
          <div className="p-2.5 rounded-full bg-red-500/10 border border-red-500/20">
            <AlertTriangle size={22} />
          </div>
          <div>
            <h3 id="delete-dialog-title" className="display text-lg font-medium text-white">
              Delete Car Listing
            </h3>
            <p className="text-[11px] text-white/50">This action cannot be undone.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded">
            {error}
          </div>
        )}

        <div className="my-5 p-3.5 bg-ink-950 border border-white/10 flex items-center gap-3.5">
          {car.images && car.images[0] ? (
            <img
              src={car.images[0]}
              alt={`${car.brand} ${car.model}`}
              className="w-16 h-14 object-cover border border-white/10 shrink-0"
            />
          ) : (
            <div className="w-16 h-14 bg-ink-800 border border-white/10 flex items-center justify-center text-xs text-white/30 shrink-0">
              No photo
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-wider text-gold-400 truncate">
              {car.brand}
            </p>
            <p className="display text-sm font-semibold text-white truncate">
              {car.model} {car.variant && <span className="text-white/60 font-normal">({car.variant})</span>}
            </p>
            <p className="text-xs text-white/50 mt-0.5">
              {car.year} · {formatPrice(car.price)}
            </p>
          </div>
        </div>

        <p className="text-xs text-white/65 leading-relaxed">
          Are you sure you want to delete this car? The vehicle record will be removed from the
          database and all associated photos will be cleaned up from storage.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white/70 hover:text-white border border-white/15 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-500 transition disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Deleting...
              </>
            ) : (
              <>
                <Trash2 size={14} /> Delete Car
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
