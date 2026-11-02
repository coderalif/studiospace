"use client";

import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RequireAuth } from "../../components/RequireAuth";
import { StudioForm } from "../../components/StudioForm";
import { api } from "../../lib/api";

export default function AddStudioPage() {
  const router = useRouter();

  async function createStudio(values) {
    // The server attaches the verified host identity to this new listing.
    const result = await api("/studios", {
      method: "POST",
      body: JSON.stringify(values),
    });
    toast.success(result.message || "Your studio listing is live.");
    router.push("/my-listings");
  }

  return (
    <RequireAuth>
      <div className="form-page page-container">
        <Link href="/studios" className="back-link">
          <ArrowLeft size={15} /> Back to studios
        </Link>
        <div className="form-page-heading">
          <div>
            <span className="eyebrow">A space worth sharing</span>
            <h1>
              Put your space <em>out there.</em>
            </h1>
            <p>
              Tell the story of your studio. The right people are looking for
              it.
            </p>
          </div>
          <span className="intro-stamp">
            <ArrowUpRight size={25} />
            <br />
            MAKE
            <br />
            SOME ROOM
          </span>
        </div>
        <StudioForm
          onSubmit={createStudio}
          submitLabel="Publish your listing"
        />
      </div>
    </RequireAuth>
  );
}
