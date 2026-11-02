"use client";

import { ImagePlus, LoaderCircle, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RequireAuth } from "../../components/RequireAuth";
import { useAuth } from "../../components/AppProviders";
import { api } from "../../lib/api";

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];
const maxImageSize = 5 * 1024 * 1024;

function ProfileSettings() {
  const { user, setUser } = useAuth();
  const [uploading, setUploading] = useState(false);

  async function uploadPhoto(file) {
    if (!file) return;
    if (!allowedImageTypes.includes(file.type)) {
      toast.error("Choose a JPG, PNG, WebP, or AVIF image.");
      return;
    }
    if (file.size > maxImageSize) {
      toast.error("Image must be 5 MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      // Upload the file first; the profile endpoint stores the hosted image URL.
      const body = new FormData();
      body.append("image", file);
      const { imageURL } = await api("/uploads", { method: "POST", body });
      const result = await api("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({ photoURL: imageURL }),
      });
      setUser(result.user);
      toast.success(result.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="profile-page page-container">
      <span className="eyebrow">Your account</span>
      <h1>
        Profile <em>settings.</em>
      </h1>
      <p className="profile-intro">Keep your account photo up to date.</p>
      <section className="profile-card" aria-labelledby="profile-photo-heading">
        <div className="profile-avatar">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={`${user.name}'s profile`} />
          ) : (
            <UserRound size={34} />
          )}
        </div>
        <div className="profile-details">
          <h2 id="profile-photo-heading">{user?.name}</h2>
          <p>{user?.email}</p>
          <label className="button button-outline profile-upload-button">
            {uploading ? (
              <>
                <LoaderCircle size={16} className="spin" /> Uploading…
              </>
            ) : (
              <>
                <ImagePlus size={16} /> Change profile photo
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(event) => {
                uploadPhoto(event.target.files?.[0]);
                event.target.value = "";
              }}
              disabled={uploading}
            />
          </label>
          <small>JPG, PNG, WebP, or AVIF. Maximum size: 5 MB.</small>
        </div>
      </section>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileSettings />
    </RequireAuth>
  );
}
