import Link from "next/link";

export const metadata = { title: "Terms — StudioSpace" };

export default function TermsPage() {
  return (
    <article className="legal-page page-container">
      <span className="eyebrow">The useful details</span>
      <h1>
        Terms of <em>use.</em>
      </h1>
      <p>
        StudioSpace helps independent hosts introduce creative spaces to people
        looking for somewhere to make. By using this assignment demo, you agree
        to treat the community and listed spaces with care.
      </p>
      <h2>Bookings and spaces</h2>
      <p>
        Booking requests are subject to host confirmation. Listing details are
        provided by hosts, who are responsible for keeping their information
        accurate and welcoming.
      </p>
      <h2>Respectful use</h2>
      <p>
        Use StudioSpace lawfully, share only content you have permission to use,
        and respect each space and its host.
      </p>
      <h2>Demo note</h2>
      <p>
        This is a student project. It is not a real booking or payment service.
      </p>
      <Link href="/" className="text-link">
        Back to StudioSpace →
      </Link>
    </article>
  );
}
