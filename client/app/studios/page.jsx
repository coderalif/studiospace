"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowDownUp, ArrowRight, ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { api } from "../../lib/api";
import { StudioCard, StudioCardSkeleton } from "../../components/StudioCard";
import { studioCategories } from "../../lib/constants";

function StudiosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCategory = searchParams.get("category") || "";
  const requestedPage = Number.parseInt(searchParams.get("page"), 10);
  const [studios, setStudios] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });
  const [page, setPage] = useState(Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1);
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileFilters, setMobileFilters] = useState(false);

  useEffect(() => {
    const queryPage = Number.parseInt(searchParams.get("page"), 10);
    const querySort = searchParams.get("sort");
    setCategory(searchParams.get("category") || "");
    setPage(Number.isInteger(queryPage) && queryPage > 0 ? queryPage : 1);
    setSearch(searchParams.get("search") || "");
    setLocation(searchParams.get("location") || "");
    setSort(["rating", "price-low", "price-high"].includes(querySort) ? querySort : "newest");
  }, [searchParams]);

  useEffect(() => {
    // Refetch when the guest changes the category, search, or location filters.
    let active = true;
    setLoading(true);
    setError("");
    const query = new URLSearchParams({ limit: "12", page: String(page) });
    if (category) query.set("category", category);
    if (search.trim()) query.set("search", search.trim());
    if (location.trim()) query.set("location", location.trim());

    api(`/studios?${query}`)
      .then(({ studios: data, pagination: pageData }) => {
        if (active) {
          if (pageData.pages ? page > pageData.pages : page > 1) {
            choosePage(pageData.pages || 1);
            return;
          }
          setStudios(data);
          setPagination(pageData);
        }
      })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [category, search, location, page]);

  // Sorting is local because the filtered result set is already loaded.
  const sortedStudios = [...studios].sort((a, b) => {
    if (sort === "price-low") return a.hourlyRate - b.hourlyRate;
    if (sort === "price-high") return b.hourlyRate - a.hourlyRate;
    if (sort === "rating") return b.rating - a.rating;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  function updateQuery(key, value, resetPage = true) {
    const query = new URLSearchParams(searchParams.toString());
    if (value) query.set(key, value);
    else query.delete(key);
    if (resetPage && key !== "page") {
      query.delete("page");
      setPage(1);
    }
    router.replace(`/studios${query.size ? `?${query}` : ""}`, { scroll: false });
  }

  function chooseCategory(value) {
    setCategory(value);
    updateQuery("category", value);
  }

  function choosePage(value) {
    setPage(value);
    updateQuery("page", value > 1 ? String(value) : "", false);
  }

  function clearFilters() {
    setSearch("");
    setLocation("");
    setSort("newest");
    setCategory("");
    setPage(1);
    const query = new URLSearchParams(searchParams.toString());
    ["category", "location", "page", "search", "sort"].forEach((key) => query.delete(key));
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
          <input value={search} onChange={(event) => { setSearch(event.target.value); updateQuery("search", event.target.value); }} placeholder="Try “sunlit photo studio”" aria-label="Search studios" />
          {search && <button aria-label="Clear search" onClick={() => { setSearch(""); updateQuery("search", ""); }}><X size={15} /></button>}
        </div>
        <div className="search-field location-field">
          <Search size={16} />
          <input value={location} onChange={(event) => { setLocation(event.target.value); updateQuery("location", event.target.value); }} placeholder="City or neighborhood" aria-label="Filter by location" />
          {location && <button aria-label="Clear location" onClick={() => { setLocation(""); updateQuery("location", ""); }}><X size={15} /></button>}
        </div>
        <div className="sort-field"><ArrowDownUp size={15} />
          <select value={sort} onChange={(event) => { setSort(event.target.value); updateQuery("sort", event.target.value === "newest" ? "" : event.target.value, false); }} aria-label="Sort studios">
            <option value="newest">Newest first</option><option value="rating">Top rated</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option>
          </select>
        </div>
        <button className="filter-toggle button button-outline" onClick={() => setMobileFilters(!mobileFilters)}><SlidersHorizontal size={16} /> Categories</button>
      </div>
      <div className={`category-filters ${mobileFilters ? "show-mobile" : ""}`}>
        <button className={!category ? "active" : ""} onClick={() => chooseCategory("")}>All spaces</button>
        {studioCategories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => chooseCategory(item)}>{item}</button>)}
      </div>
      <div className="results-meta"><span>{loading ? "Finding your space…" : `${pagination.total} ${pagination.total === 1 ? "space" : "spaces"} to explore`}</span><Link href="/add-studio">Have a space to share? <strong>List it <ArrowRight size={14} /></strong></Link></div>
      {error ? <div className="empty-state"><div className="empty-icon">!</div><h2>We couldn’t reach the studio directory.</h2><p>{error}</p><button className="button button-dark" onClick={() => window.location.reload()}>Try again</button></div> :
        loading ? <div className="studio-grid">{Array.from({ length: 6 }).map((_, i) => <StudioCardSkeleton key={i} />)}</div> :
          sortedStudios.length ? <>
            <div className="studio-grid">{sortedStudios.map((studio) => <StudioCard key={studio._id} studio={studio} />)}</div>
            {pagination.pages > 1 && <nav className="studio-pagination" aria-label="Studio directory pages">
              <button className="button button-outline" type="button" onClick={() => choosePage(page - 1)} disabled={page <= 1}><ChevronLeft size={16} /> Previous</button>
              <span>Page {pagination.page} of {pagination.pages}</span>
              <button className="button button-outline" type="button" onClick={() => choosePage(page + 1)} disabled={page >= pagination.pages}>Next <ChevronRight size={16} /></button>
            </nav>}
          </> :
            <div className="empty-state"><div className="empty-icon">✳</div><h2>No spaces found just yet.</h2><p>Try a different search, or be the first to share a space in this category.</p><div className="empty-actions"><button className="button button-outline" onClick={clearFilters}>Clear filters</button><Link className="button button-dark" href="/add-studio">List a studio <ArrowRight size={16} /></Link></div></div>}
    </div>
  );
}

export default function StudiosPage() {
  return <Suspense fallback={<div className="page-container page-loading"><span className="spinner" /> Finding your space…</div>}><StudiosContent /></Suspense>;
}
