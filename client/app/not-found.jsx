import Link from "next/link";
import { Aperture, ArrowLeft, ArrowRight } from "lucide-react";

export default function NotFound() {
  // Give invalid routes a branded recovery path instead of a browser error page.
  return (
    <div className="not-found-page page-container">
      <div className="not-found-art">
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <div className="not-found-aperture">
          <Aperture size={112} strokeWidth={1} />
        </div>
        <span className="art-spark art-spark-one">✳</span>
        <span className="art-spark art-spark-two">✴</span>
        <span className="art-caption">
          NOT ALL WHO WANDER
          <br />
          ARE LOST. BUT YOU
          <br />
          MIGHT BE.
        </span>
      </div>
      <div className="not-found-copy">
        <span className="eyebrow">Looks like we missed a turn</span>
        <h1>
          This page is
          <br />
          <em>out of frame.</em>
        </h1>
        <p>
          The page you’re looking for has moved, taken a creative detour, or was
          never here in the first place.
        </p>
        <div className="empty-actions">
          <Link href="/" className="button button-dark">
            <ArrowLeft size={16} /> Return to home
          </Link>
          <Link href="/studios" className="text-link">
            Explore studios <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
