"use client";

import { ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

export function NewsletterForm() {
  function submit(event) {
    event.preventDefault();
    toast.error("Newsletter sign-up will be available when email updates are connected.");
  }

  return (
    <form onSubmit={submit}>
      <label className="sr-only" htmlFor="newsletter-email">Your email address</label>
      <input id="newsletter-email" type="email" placeholder="Your email address" required />
      <button type="submit" aria-label="Subscribe"><ArrowUpRight size={18} /></button>
    </form>
  );
}
