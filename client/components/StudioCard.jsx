import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Heart, MapPin, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "./AppProviders";
import { api, imageUrl, money, studioId } from "../lib/api";

export function StudioCard({ studio, onUnsave }) {
  const id = studioId(studio);
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const isSaved = user?.savedStudios?.includes(id) || false;

  async function toggleSaved() {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent("/saved-studios")}`);
      return;
    }

    setSaving(true);
    try {
      const result = await api(`/studios/${id}/saved`, {
        method: isSaved ? "DELETE" : "PUT",
      });
      setUser((currentUser) => ({
        ...currentUser,
        savedStudios: result.savedStudios,
      }));
      if (isSaved) onUnsave?.(id);
      toast.success(result.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="studio-card">
      <Link className="studio-card-image" href={`/studios/${id}`}>
        <img src={imageUrl(studio)} alt={studio.title} loading="lazy" />
        <span className="category-pill">{studio.category}</span>
        <span className="rating-pill">
          <Star size={13} fill="currentColor" />{" "}
          {Number(studio.rating || 0).toFixed(1)}
        </span>
      </Link>
      <button
        className={`save-studio-button ${isSaved ? "is-saved" : ""}`}
        type="button"
        onClick={toggleSaved}
        disabled={saving}
        title={isSaved ? "Saved in wishlist" : "Save to wishlist"}
        aria-label={
          isSaved
            ? `Remove ${studio.title} from saved studios`
            : `Save ${studio.title}`
        }
        aria-pressed={isSaved}
      >
        <Heart size={17} fill={isSaved ? "currentColor" : "none"} />
      </button>
      <div className="studio-card-body">
        <div className="studio-card-title-row">
          <h3>
            <Link href={`/studios/${id}`}>{studio.title}</Link>
          </h3>
          <ArrowUpRight size={17} className="card-arrow" />
        </div>
        <p className="studio-location">
          <MapPin size={14} /> {studio.location}
        </p>
        <div className="studio-card-bottom">
          <span>
            <strong>${money(studio.hourlyRate)}</strong> / hr
          </span>
          <Link className="card-view-link" href={`/studios/${id}`}>
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

// Keep the card layout visible while the studio request is still in flight.
export function StudioCardSkeleton() {
  return (
    <div className="studio-card skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-image" />
      <div className="skeleton-content">
        <div className="skeleton skeleton-line wide" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line short" />
      </div>
    </div>
  );
}
