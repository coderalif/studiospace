import Link from "next/link";

export const metadata = { title: "Privacy — StudioSpace" };

export default function PrivacyPage() {
  return <article className="legal-page page-container"><span className="eyebrow">A little privacy matters</span><h1>Your details, <em>kept thoughtfully.</em></h1><p>This StudioSpace student project uses account details to provide sign-in, listing, review, and booking features. Passwords are hashed by the API, and authentication uses an HTTP-only cookie.</p><h2>What this demo stores</h2><p>Account name, email, optional photo, studio listings, reviews, and booking requests may be stored in the project's MongoDB database.</p><h2>External services</h2><p>Google sign-in and ImgBB image uploads are optional and only work when configured by the developer.</p><h2>Demo note</h2><p>Please use test credentials only. This is not a commercial booking service.</p><Link href="/" className="text-link">Back to StudioSpace →</Link></article>;
}
