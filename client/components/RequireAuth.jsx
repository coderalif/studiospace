"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AppProviders";

export function RequireAuth({ children }) {
  const { user, authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authLoading && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [authLoading, user, router, pathname]);

  if (authLoading || !user) {
    return <div className="page-loading"><span className="spinner" /> Getting your space ready…</div>;
  }

  return children;
}
