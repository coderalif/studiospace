import Link from "next/link";
import { ArrowUpRight, MapPin, Star } from "lucide-react";
import { imageUrl, money, studioId } from "../lib/api";

export function StudioCard({ studio }) {
  const id = studioId(studio);

  return (
    <article className="studio-card">
      <Link className="studio-card-image" href={`/studios/${id}`}>
        <img src={imageUrl(studio)} alt={studio.title} loading="lazy" />
        <span className="category-pill">{studio.category}</span>
        <span className="rating-pill"><Star size={13} fill="currentColor" /> {Number(studio.rating || 0).toFixed(1)}</span>
      </Link>
      <div className="studio-card-body">
        <div className="studio-card-title-row">
          <h3><Link href={`/studios/${id}`}>{studio.title}</Link></h3>
          <ArrowUpRight size={17} className="card-arrow" />
        </div>
        <p className="studio-location"><MapPin size={14} /> {studio.location}</p>
        <div className="studio-card-bottom">
          <span><strong>${money(studio.hourlyRate)}</strong> / hr</span>
          <Link className="card-view-link" href={`/studios/${id}`}>View studio</Link>
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
