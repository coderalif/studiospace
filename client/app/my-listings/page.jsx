"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RequireAuth } from "../../components/RequireAuth";
import { api, imageUrl, money, studioId } from "../../lib/api";

function MyListingsContent() {
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);

  function load() {
    setLoading(true);
    api("/studios/mine")
      .then(({ studios: data }) => setStudios(data))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function removeStudio(id) {
    try {
      const result = await api(`/studios/${id}`, { method: "DELETE" });
      toast.success(result.message || "Studio listing deleted.");
      setStudios((current) =>
        current.filter((studio) => studioId(studio) !== id),
      );
      setDeleting(null);
    } catch (requestError) {
      toast.error(requestError.message);
      setDeleting(null);
    }
  }

  return (
    <div className="dashboard-page page-container">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">Your creative corner</span>
          <h1>
            Your <em>spaces.</em>
          </h1>
          <p>
            Everything you’ve shared with the maker community, all in one place.
          </p>
        </div>
        <Link className="button button-dark" href="/add-studio">
          <Plus size={17} /> Add a space
        </Link>
      </div>
      {error ? (
        <div className="empty-state">
          <h2>Couldn’t load your listings.</h2>
          <p>{error}</p>
          <button className="button button-dark" onClick={load}>
            Try again
          </button>
        </div>
      ) : loading ? (
        <div className="page-loading">
          <span className="spinner" /> Gathering your spaces…
        </div>
      ) : studios.length ? (
        <div className="listing-management">
          {studios.map((studio) => {
            const id = studioId(studio);
            return (
              <article className="management-card" key={id}>
                <Link href={`/studios/${id}`} className="management-image">
                  <img src={imageUrl(studio)} alt={studio.title} />
                </Link>
                <div className="management-info">
                  <span className="eyebrow">{studio.category}</span>
                  <h2>
                    <Link href={`/studios/${id}`}>{studio.title}</Link>
                  </h2>
                  <p>
                    <MapPin size={14} /> {studio.location}
                  </p>
                  <span className="management-rate">
                    <strong>${money(studio.hourlyRate)}</strong> / hour
                  </span>
                </div>
                <div className="management-actions">
                  <Link
                    className="button button-outline"
                    href={`/studios/edit/${id}`}
                  >
                    <Pencil size={15} /> Edit
                  </Link>
                  <button
                    className="button button-danger-outline"
                    onClick={() => setDeleting(id)}
                  >
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">✳</div>
          <h2>Your first space starts here.</h2>
          <p>
            Share your studio with a community that cares about what gets made
            in it.
          </p>
          <Link className="button button-dark" href="/add-studio">
            List your first space <ArrowRight size={16} />
          </Link>
        </div>
      )}
      {deleting && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDeleting(null);
          }}
        >
          <div
            className="confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
          >
            <span className="modal-symbol">
              <Trash2 size={20} />
            </span>
            <h2 id="delete-title">Take this space down?</h2>
            <p>
              This listing will be removed. You can always list it again later.
              Spaces with upcoming bookings can’t be deleted yet.
            </p>
            <div className="modal-actions">
              <button
                className="button button-outline"
                onClick={() => setDeleting(null)}
              >
                Keep listing
              </button>
              <button
                className="button button-danger"
                onClick={() => removeStudio(deleting)}
              >
                Yes, delete it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyListingsPage() {
  return (
    <RequireAuth>
      <MyListingsContent />
    </RequireAuth>
  );
}
