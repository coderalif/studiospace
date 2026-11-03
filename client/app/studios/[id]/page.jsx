"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  ShieldCheck,
  Star,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../../components/AppProviders";
import { api, imageUrl, money, studioId } from "../../../lib/api";

function BookingDialog({ studio, onClose }) {
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [busy, setBusy] = useState(false);
  const minDate = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  // Show an estimate while the server calculates and validates the real booking.
  const hours =
    startAt && endAt
      ? Math.max((new Date(endAt) - new Date(startAt)) / 3600000, 0)
      : 0;
  const total = Math.round(hours * studio.hourlyRate * 100) / 100;

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await api("/bookings", {
        method: "POST",
        body: JSON.stringify({
          studioId: studioId(studio),
          startAt: new Date(startAt).toISOString(),
          endAt: new Date(endAt).toISOString(),
          guestCount: Number(guestCount),
        }),
      });
      toast.success(result.message || "Booking request sent to your host.");
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose(false);
      }}
    >
      <div
        className="booking-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
      >
        <div className="modal-heading">
          <div>
            <span className="eyebrow">A few details, then it’s yours</span>
            <h2 id="booking-title">Request a booking.</h2>
          </div>
          <button
            className="icon-button"
            onClick={() => onClose(false)}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <p className="booking-studio-name">
          {studio.title} · ${money(studio.hourlyRate)} / hour
        </p>
        <form onSubmit={submit}>
          <label>
            Start time
            <input
              type="datetime-local"
              required
              min={minDate}
              value={startAt}
              onChange={(event) => setStartAt(event.target.value)}
            />
          </label>
          <label>
            End time
            <input
              type="datetime-local"
              required
              min={startAt || minDate}
              value={endAt}
              onChange={(event) => setEndAt(event.target.value)}
            />
          </label>
          <label>
            How many guests?
            <select
              value={guestCount}
              onChange={(event) => setGuestCount(event.target.value)}
            >
              {Array.from({ length: studio.maxCapacity }, (_, index) => (
                <option value={index + 1} key={index + 1}>
                  {index + 1} {index === 0 ? "guest" : "guests"}
                </option>
              ))}
            </select>
          </label>
          <div className="booking-total">
            <span>
              {hours > 0
                ? `${hours.toFixed(1)} hours · estimated total`
                : "Choose your time · estimated total"}
            </span>
            <strong>${money(total)}</strong>
            <small>Final confirmation comes from your host.</small>
          </div>
          <button
            className="button button-dark auth-submit"
            disabled={busy || !startAt || !endAt || endAt <= startAt}
          >
            {busy ? "Sending your request…" : "Request this space"}{" "}
            <ArrowRight size={17} />
          </button>
        </form>
      </div>
    </div>
  );
}

function ReviewForm({ studio, onDone }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await api(`/studios/${studioId(studio)}/reviews`, {
        method: "POST",
        body: JSON.stringify({ rating, comment }),
      });
      toast.success(result.message || "Your review has been added.");
      onDone(result.studio);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="review-form" onSubmit={submit}>
      <label>
        Your rating
        <select
          value={rating}
          onChange={(event) => setRating(Number(event.target.value))}
        >
          <option value="5">5 — Loved it</option>
          <option value="4">4 — Really good</option>
          <option value="3">3 — Good</option>
          <option value="2">2 — Could be better</option>
          <option value="1">1 — Not for me</option>
        </select>
      </label>
      <label>
        Your experience
        <textarea
          rows={3}
          required
          maxLength={1000}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="What should the next guest know?"
        />
      </label>
      <button className="button button-dark" disabled={busy}>
        {busy ? "Adding your review…" : "Share your review"}
      </button>
    </form>
  );
}

function StudioDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { user, authLoading } = useAuth();
  const [studio, setStudio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    api(`/studios/${id}`)
      .then(({ studio: value }) => setStudio(value))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [id]);

  const ownerId = studio?.owner?._id || studio?.owner;
  const isOwner =
    user && ownerId && String(user.id || user._id) === String(ownerId);
  const average = Number(studio?.rating || 0).toFixed(1);
  // Use the uploaded image first, with two gallery images as visual alternatives.
  const gallery = studio
    ? [
        imageUrl(studio),
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=85",
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=85",
      ]
    : [];

  if (loading)
    return (
      <div className="page-loading">
        <span className="spinner" /> Finding the details…
      </div>
    );
  if (error || !studio)
    return (
      <div className="empty-state page-container">
        <h2>This space is taking a little break.</h2>
        <p>{error || "We couldn't find this studio."}</p>
        <Link className="button button-dark" href="/studios">
          Back to all studios
        </Link>
      </div>
    );

  return (
    <>
      <div className="detail-page page-container">
        <Link href="/studios" className="back-link">
          <ArrowLeft size={15} /> All studios
        </Link>
        <div className="detail-title-row">
          <div>
            <span className="eyebrow">{studio.category}</span>
            <h1>{studio.title}</h1>
            <p>
              <MapPin size={16} /> {studio.location}
            </p>
          </div>
          <div className="detail-rating">
            <Star size={16} fill="currentColor" />
            <strong>{average}</strong>
            <span>({studio.reviews?.length || 0} reviews)</span>
          </div>
        </div>
        <div className="detail-gallery">
          <div className="detail-gallery-main">
            <img
              src={gallery[activeImage]}
              alt={`${studio.title} — photo ${activeImage + 1}`}
            />
            <button
              className="gallery-arrow gallery-previous"
              onClick={() =>
                setActiveImage(
                  (activeImage + gallery.length - 1) % gallery.length,
                )
              }
              aria-label="Previous studio photo"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className="gallery-arrow gallery-next"
              onClick={() => setActiveImage((activeImage + 1) % gallery.length)}
              aria-label="Next studio photo"
            >
              <ChevronRight size={20} />
            </button>
            <span className="gallery-count">
              {activeImage + 1} / {gallery.length}
            </span>
          </div>
          <div className="detail-gallery-side">
            {gallery.slice(1).map((photo, index) => (
              <button
                className={`gallery-thumbnail ${activeImage === index + 1 ? "active" : ""}`}
                onClick={() => setActiveImage(index + 1)}
                key={photo}
                aria-label={`Show studio photo ${index + 2}`}
              >
                <img src={photo} alt="" />
              </button>
            ))}
          </div>
        </div>
        <div className="detail-layout">
          <div className="detail-content">
            <div className="host-intro">
              <div className="host-avatar">
                {studio.owner?.photoURL ? (
                  <img src={studio.owner.photoURL} alt="" />
                ) : (
                  studio.ownerName?.slice(0, 1) || "S"
                )}
              </div>
              <div>
                <h2>Hosted by {studio.owner?.name || studio.ownerName}</h2>
                <p>
                  <ShieldCheck size={14} /> Independent creative host
                </p>
              </div>
            </div>
            <section className="detail-section">
              <span className="eyebrow">The space</span>
              <h2>A good place to make something.</h2>
              <p className="detail-overview">{studio.overview}</p>
            </section>
            <section className="detail-section">
              <span className="eyebrow">The details</span>
              <h2>Everything in its right place.</h2>
              <div className="spec-grid">
                <div>
                  <Clock3 size={18} />
                  <span>
                    <strong>Easy hourly booking</strong>
                    <small>Plan time that works for you</small>
                  </span>
                </div>
                <div>
                  <Users size={18} />
                  <span>
                    <strong>Up to {studio.maxCapacity} people</strong>
                    <small>Room for your crew</small>
                  </span>
                </div>
                <div>
                  <ShieldCheck size={18} />
                  <span>
                    <strong>
                      ${money(studio.securityDeposit)} security deposit
                    </strong>
                    <small>Handled securely</small>
                  </span>
                </div>
              </div>
            </section>
            <section className="detail-section">
              <span className="eyebrow">The good-to-knows</span>
              <h2>Thoughtful little extras.</h2>
              {studio.amenities?.length ? (
                <div className="amenities-list">
                  {studio.amenities.map((amenity) => (
                    <span key={amenity}>
                      <Check size={15} /> {amenity}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="muted-copy">
                  Your host hasn’t added amenities yet.
                </p>
              )}
            </section>
            <section className="detail-section review-section">
              <span className="eyebrow">Notes from the community</span>
              <h2>Good words from good people.</h2>
              {studio.reviews?.length ? (
                <div className="review-list">
                  {studio.reviews.map((review) => (
                    <article className="review-card" key={review._id}>
                      <div className="review-top">
                        <strong>{review.authorName}</strong>
                        <span>
                          <Star size={13} fill="currentColor" /> {review.rating}
                        </span>
                      </div>
                      <p>{review.comment}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="muted-copy">
                  The first review is still waiting to be written.
                </p>
              )}
              {!authLoading && user && !isOwner && (
                <ReviewForm studio={studio} onDone={setStudio} />
              )}
            </section>
          </div>
          <aside className="booking-card">
            <div className="booking-price">
              <strong>${money(studio.hourlyRate)}</strong>
              <span> / hour</span>
              <span className="booking-rating">
                <Star size={14} fill="currentColor" /> {average}
              </span>
            </div>
            <div className="booking-card-note">
              <Check size={16} /> Request a time that works for you
            </div>
            <div className="booking-card-note">
              <Check size={16} /> Your host confirms the booking
            </div>
            {isOwner ? (
              <Link
                className="button button-outline booking-cta"
                href={`/studios/edit/${id}`}
              >
                Manage your listing <ArrowRight size={16} />
              </Link>
            ) : (
              <button
                className="button button-dark booking-cta"
                onClick={() =>
                  user
                    ? setBookingOpen(true)
                    : router.push(
                        `/login?next=${encodeURIComponent(`/studios/${id}`)}`,
                      )
                }
              >
                Book Workspace Now <ArrowRight size={16} />
              </button>
            )}
            <p className="booking-safe-note">
              <ShieldCheck size={14} /> No charge until your host confirms.
            </p>
          </aside>
        </div>
      </div>
      {bookingOpen && (
        <BookingDialog studio={studio} onClose={() => setBookingOpen(false)} />
      )}
    </>
  );
}

export default function StudioDetailsPage() {
  return <StudioDetails />;
}
