import Link from "next/link";
import { Aperture, ArrowUpRight, Instagram, Linkedin } from "lucide-react";
import { NewsletterForm } from "./NewsletterForm";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-about">
          <Link className="brand footer-brand" href="/">
            <span className="brand-mark"><Aperture size={21} /></span>
            <span>studio<span className="brand-light">space</span></span>
          </Link>
          <p>Good things happen when creative people find the right space.</p>
          <div className="social-links">
            <a href="https://www.instagram.com/" aria-label="Instagram"><Instagram size={18} /></a>
            <a href="https://x.com/" aria-label="X"><span className="x-social">𝕏</span></a>
            <a href="https://www.linkedin.com/" aria-label="LinkedIn"><Linkedin size={18} /></a>
          </div>
        </div>
        <div className="footer-column">
          <h3>Explore</h3>
          <Link href="/studios">All studios</Link>
          <Link href="/studios?category=Photo%20Studio">Photo studios</Link>
          <Link href="/studios?category=Film%20Stage">Sound stages</Link>
          <Link href="/studios?category=Podcast%20Lounge">Podcast rooms</Link>
          <Link href="/studios?category=Music%20Suite">Music suites</Link>
          <Link href="/studios?category=Art%20Workshop">Art workshops</Link>
        </div>
        <div className="footer-column">
          <h3>Your space</h3>
          <Link href="/add-studio">List a studio <ArrowUpRight size={14} /></Link>
          <Link href="/my-listings">Manage listings</Link>
          <Link href="/my-bookings">My bookings</Link>
          <Link href="/register">Create an account</Link>
        </div>
        <div className="footer-newsletter">
          <h3>A little creative energy.</h3>
          <p>Fresh spaces and studio stories, now and then.</p>
          <NewsletterForm />
          <small>By subscribing, you agree to our friendly occasional email.</small>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} StudioSpace. Made for the makers.</span>
        <span><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link></span>
      </div>
    </footer>
  );
}
