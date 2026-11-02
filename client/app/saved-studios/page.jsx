"use client";

import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { RequireAuth } from "../../components/RequireAuth";
import { StudioCard, StudioCardSkeleton } from "../../components/StudioCard";
import { api, studioId } from "../../lib/api";

function SavedStudiosContent() {
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function loadSavedStudios() {
    setLoading(true);
    setError("");
    api("/studios/saved")
      .then(({ studios: data }) => setStudios(data))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadSavedStudios();
  }, []);

  function removeSavedStudio(id) {
    setStudios((current) => current.filter((studio) => studioId(studio) !== id));
  }

  return (
    <div className="dashboard-page page-container">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">Saved for later</span>
          <h1>Your <em>shortlist.</em></h1>
          <p>Keep the spaces you love close by for your next project.</p>
        </div>
        <Link className="button button-dark" href="/studios">
          Find a space <ArrowRight size={16} />
        </Link>
      </div>

      {error ? (
        <div className="empty-state">
          <h2>Couldn’t load your saved spaces.</h2>
          <p>{error}</p>
          <button className="button button-dark" onClick={loadSavedStudios}>Try again</button>
        </div>
      ) : loading ? (
        <div className="studio-grid">
          {Array.from({ length: 3 }).map((_, index) => <StudioCardSkeleton key={index} />)}
        </div>
      ) : studios.length ? (
        <div className="studio-grid">
          {studios.map((studio) => (
            <StudioCard key={studioId(studio)} studio={studio} onUnsave={removeSavedStudio} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon"><Heart size={24} /></div>
          <h2>Your shortlist is ready when you are.</h2>
          <p>Tap the heart on a studio to save it here for later.</p>
          <Link className="button button-dark" href="/studios">Explore studios <ArrowRight size={16} /></Link>
        </div>
      )}
    </div>
  );
}

export default function SavedStudiosPage() {
  return <RequireAuth><SavedStudiosContent /></RequireAuth>;
}
