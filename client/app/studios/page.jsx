"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowDownUp, ArrowRight, Search, SlidersHorizontal, X } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { api } from "../../lib/api";
import { StudioCard, StudioCardSkeleton } from "../../components/StudioCard";
import { studioCategories } from "../../lib/constants";

function StudiosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCategory = searchParams.get("category") || "";
  const [studios, setStudios] = useState([]);
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileFilters, setMobileFilters] = useState(false);

  useEffect(() => {
    // Refetch when the guest changes the category, search, or location filters.
    let active = true;
    setLoading(true);
    setError("");
    const query = new URLSearchParams({ limit: "50" });
    if (category) query.set("category", category);
    if (search.trim()) query.set("search", search.trim());
    if (location.trim()) query.set("location", location.trim());

    api(`/studios?${query}`)
      .then(({ studios: data }) => { if (active) setStudios(data); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [category, search, location]);

  // Sorting is local because the filtered result set is already loaded.
  const sortedStudios = [...studios].sort((a, b) => {
    if (sort === "price-low") return a.hourlyRate - b.hourlyRate;
    if (sort === "price-high") return b.hourlyRate - a.hourlyRate;
    if (sort === "rating") return b.rating - a.rating;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  function chooseCategory(value) {
    setCategory(value);
    const query = new URLSearchParams(searchParams.toString());
    if (value) query.set("category", value);
    else query.delete("category");
    router.replace(`/studios${query.size ? `?${query}` : ""}`, { scroll: false });
  }

  return (
    <div className="listing-page page-container">
      <div className="page-intro">
        <div><span className="eyebrow">The studio directory</span><h1>Find your next <em>creative space.</em></h1>
          <p>Distinctive spaces. Independent hosts. Room for a really good idea.</p></div>
        <span className="intro-stamp">MADE FOR<br />MAKING <span>✳</span></span>
      </div>
      <div className="studio-toolbar">
        <div className="search-field">
          <Search size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Try “sunlit photo studio”" aria-label="Search studios" />
          {search && <button aria-label="Clear search" onClick={() => setSearch("")}><X size={15} /></button>}
        </div>
        <div className="search-field location-field">
          <Search size={16} />
          <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City or neighborhood" aria-label="Filter by location" />
          {location && <button aria-label="Clear location" onClick={() => setLocation("")}><X size={15} /></button>}
        </div>
        <div className="sort-field"><ArrowDownUp size={15} />
          <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort studios">
            <option value="newest">Newest first</option><option value="rating">Top rated</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option>
          </select>
        </div>
        <button className="filter-toggle button button-outline" onClick={() => setMobileFilters(!mobileFilters)}><SlidersHorizontal size={16} /> Categories</button>
      </div>
      <div className={`category-filters ${mobileFilters ? "show-mobile" : ""}`}>
        <button className={!category ? "active" : ""} onClick={() => chooseCategory("")}>All spaces</button>
        {studioCategories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => chooseCategory(item)}>{item}</button>)}
      </div>
      <div className="results-meta"><span>{loading ? "Finding your space…" : `${sortedStudios.length} ${sortedStudios.length === 1 ? "space" : "spaces"} to explore`}</span><Link href="/add-studio">Have a space to share? <strong>List it <ArrowRight size={14} /></strong></Link></div>
      {error ? <div className="empty-state"><div className="empty-icon">!</div><h2>We couldn’t reach the studio directory.</h2><p>{error}</p><button className="button button-dark" onClick={() => window.location.reload()}>Try again</button></div> :
        loading ? <div className="studio-grid">{Array.from({ length: 6 }).map((_, i) => <StudioCardSkeleton key={i} />)}</div> :
          sortedStudios.length ? <div className="studio-grid">{sortedStudios.map((studio) => <StudioCard key={studio._id} studio={studio} />)}</div> :
            <div className="empty-state"><div className="empty-icon">✳</div><h2>No spaces found just yet.</h2><p>Try a different search, or be the first to share a space in this category.</p><div className="empty-actions"><button className="button button-outline" onClick={() => { setSearch(""); setLocation(""); chooseCategory(""); }}>Clear filters</button><Link className="button button-dark" href="/add-studio">List a studio <ArrowRight size={16} /></Link></div></div>}
    </div>
  );
}

export default function StudiosPage() {
  return <Suspense fallback={<div className="page-container page-loading"><span className="spinner" /> Finding your space…</div>}><StudiosContent /></Suspense>;
}
