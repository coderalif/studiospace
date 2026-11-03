"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RequireAuth } from "../../../../components/RequireAuth";
import { StudioForm } from "../../../../components/StudioForm";
import { api, studioId } from "../../../../lib/api";

function EditStudioContent() {
  const { id } = useParams();
  const router = useRouter();
  const [studio, setStudio] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load the existing record so the shared form can start with saved values.
    api(`/studios/${id}`)
      .then(({ studio: value }) => setStudio(value))
      .catch((requestError) => setError(requestError.message));
  }, [id]);

  async function save(values) {
    const result = await api(`/studios/${id}`, {
      method: "PATCH",
      body: JSON.stringify(values),
    });
    toast.success(result.message || "Your listing has been updated.");
    router.push("/my-listings");
  }

  if (error)
    return (
      <div className="empty-state page-container">
        <h2>We couldn’t open this listing.</h2>
        <p>{error}</p>
        <Link className="button button-dark" href="/my-listings">
          Back to your listings
        </Link>
      </div>
    );
  if (!studio)
    return (
      <div className="page-loading">
        <span className="spinner" /> Loading your studio…
      </div>
    );
  return (
    <div className="form-page page-container">
      <Link href="/my-listings" className="back-link">
        <ArrowLeft size={15} /> Back to your listings
      </Link>
      <div className="form-page-heading">
        <div>
          <span className="eyebrow">A thoughtful little refresh</span>
          <h1>
            Make it even <em>better.</em>
          </h1>
          <p>Keep the details up to date so the right people can find you.</p>
        </div>
      </div>
      <StudioForm
        key={studioId(studio)}
        initialValue={studio}
        onSubmit={save}
        submitLabel="Save Changes"
      />
    </div>
  );
}

export default function EditStudioPage() {
  return (
    <RequireAuth>
      <EditStudioContent />
    </RequireAuth>
  );
}
