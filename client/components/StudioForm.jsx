"use client";

import { ImagePlus, LoaderCircle, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { amenityOptions, studioCategories } from "../lib/constants";

const blankStudio = {
  title: "",
  category: "",
  hourlyRate: "",
  securityDeposit: "0",
  maxCapacity: "1",
  location: "",
  imageURL: "",
  amenities: [],
  overview: "",
};

export function StudioForm({ initialValue = blankStudio, onSubmit, submitLabel }) {
  const [form, setForm] = useState({
    ...blankStudio,
    ...initialValue,
    hourlyRate: initialValue.hourlyRate ?? "",
    securityDeposit: initialValue.securityDeposit ?? "0",
    maxCapacity: initialValue.maxCapacity ?? "1",
    amenities: initialValue.amenities || [],
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleAmenity(item) {
    update("amenities", form.amenities.includes(item)
      ? form.amenities.filter((amenity) => amenity !== item)
      : [...form.amenities, item]);
  }

  async function uploadImage(file) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
      toast.error("Choose a JPG, PNG, WebP, or AVIF image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5 MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("image", file);
      const result = await api("/uploads", { method: "POST", body });
      update("imageURL", result.imageURL);
      toast.success("Your studio photo is ready.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      await onSubmit({
        ...form,
        hourlyRate: Number(form.hourlyRate),
        securityDeposit: Number(form.securityDeposit),
        maxCapacity: Number(form.maxCapacity),
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="studio-form" onSubmit={submit}>
      <div className="form-section-heading"><span>01</span><div><h2>The essentials</h2><p>Give your space a name and a few key details.</p></div></div>
      <div className="form-grid">
        <label className="form-span-2">Studio name<input required maxLength={120} value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="e.g. The Sunroom — Natural Light Studio" /></label>
        <label>Category<select required value={form.category} onChange={(event) => update("category", event.target.value)}><option value="" disabled>Choose your kind of space</option>{studioCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Location<input required maxLength={200} value={form.location} onChange={(event) => update("location", event.target.value)} placeholder="Neighborhood, city" /></label>
        <label>Hourly rate ($)<input type="number" required min="1" step="1" value={form.hourlyRate} onChange={(event) => update("hourlyRate", event.target.value)} placeholder="75" /></label>
        <label>Security deposit ($)<input type="number" min="0" step="1" value={form.securityDeposit} onChange={(event) => update("securityDeposit", event.target.value)} /></label>
        <label>Maximum capacity<input type="number" min="1" step="1" required value={form.maxCapacity} onChange={(event) => update("maxCapacity", event.target.value)} /></label>
      </div>
      <div className="form-section-heading"><span>02</span><div><h2>Show them around</h2><p>Choose an image and describe what makes this space special.</p></div></div>
      <div className="form-grid">
        <label className="form-span-2">Studio image URL<input type="url" required value={form.imageURL} onChange={(event) => update("imageURL", event.target.value)} placeholder="https://your-image-link.com/photo.jpg" /></label>
        <label className="image-upload-label form-span-2">Or upload a photo <span>JPG, PNG, WebP or AVIF, up to 5 MB</span>
          <div className="image-upload-box">
            {form.imageURL ? <img src={form.imageURL} alt="Studio preview" /> : <div><ImagePlus size={23} /><strong>Choose a beautiful photo</strong><small>Clear, well-lit spaces make the best first impression.</small></div>}
            <label className="button button-outline upload-button">{uploading ? <><LoaderCircle size={16} className="spin" /> Uploading…</> : <><ImagePlus size={16} /> {form.imageURL ? "Replace photo" : "Upload image"}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => uploadImage(event.target.files?.[0])} disabled={uploading} /></>}</label>
            {form.imageURL && <button className="image-remove" type="button" onClick={() => update("imageURL", "")} aria-label="Remove image"><X size={16} /></button>}
          </div>
        </label>
        <label className="form-span-2">The story of this space<textarea required rows={5} maxLength={5000} value={form.overview} onChange={(event) => update("overview", event.target.value)} placeholder="What makes this space feel different? Tell guests what they can create here." /></label>
      </div>
      <div className="form-section-heading"><span>03</span><div><h2>The thoughtful details</h2><p>Help guests picture how the space will work for them.</p></div></div>
      <div className="amenity-choices">{amenityOptions.map((item) => <label key={item} className={`amenity-choice ${form.amenities.includes(item) ? "selected" : ""}`}><input type="checkbox" checked={form.amenities.includes(item)} onChange={() => toggleAmenity(item)} /><span>{item}</span></label>)}</div>
      <div className="host-readonly"><span>Hosted by</span><strong>Verified from your signed-in account</strong><small>Your name and email are attached securely by StudioSpace.</small></div>
      <div className="form-submit-row"><p>Good spaces deserve a good introduction. Take your time.</p><button className="button button-dark" disabled={busy || uploading}>{busy ? "Saving your space…" : submitLabel} <span>→</span></button></div>
    </form>
  );
}
