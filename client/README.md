# StudioSpace — Peer-to-Peer Creative Workspace & Production Studio Sharing Platform

StudioSpace is a high-performance peer-to-peer marketplace designed for creators, filmmakers, photographers, podcasters, and musicians. Studio owners and hosts can list their creative spaces—ranging from photography cyc walls and cinema sound stages to podcast lounges, music recording suites, and art workshops. Fellow creators can discover, filter, inspect dynamic availability, and reserve studio slots with transparent pricing and real-time booking management.

**Live Website Link:** https://studiospace-pearl.vercel.app  
**Live API Link:** https://studiospace-j8pk.vercel.app/api  
**Local Development:** `http://localhost:3000`

---

## Key Features

- **Full Creative Workspace CRUD:** Add, browse, filter, inspect, update, and delete creative spaces with owner-only access controls and custom confirmation dialogs.
- **Dynamic Featured Spaces & Category Filters:** View 6 top-rated studio listings dynamically fetched from MongoDB, and jump directly into pre-filtered categories (Photo Studios, Sound Stages, Podcast Rooms, Music Suites, Art Workshops).
- **Secure Authentication & Session Management:** Register and log in with email/password (with uppercase, lowercase, and 6+ character validation) or one-click Google OAuth authentication; protected sessions run on HTTPOnly JWT cookies.
- **Real-Time Booking & Double-Booking Prevention:** Request hourly booking slots with instant calculation, guest selection, and automatic overlap checks preventing duplicate reservations.
- **Theme Customization & Responsive UI:** Seamless light-to-dark mode toggling across the entire platform, complete with mobile-responsive layouts and sticky navigation.
- **Interactive Swiper Hero Slider & 4-Step Workflow:** High-resolution hero carousel, a clear 4-step creative workflow, and comprehensive host guarantees (Liability Protection, Verified Profiles, Equipment Safety, 24/7 Support).
- **PDF Invoices & Saved Wishlist:** Download official PDF booking receipts for confirmed studio slots and bookmark favorite spaces with the wishlist system.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | Next.js 16 (App Router), React 19, JavaScript |
| **Styling & UI Icons** | Custom Theme CSS Variables, Lucide React Icons, Swiper.js |
| **Notifications & Modals** | Sonner Toast Notifications, Accessible Custom Modals |
| **Authentication** | JWT via Secure HTTPOnly Cookies, Google OAuth |
| **Backend & Database** | Node.js, Express.js 5, MongoDB, Mongoose |
| **File Generation & Uploads** | PDFKit (Invoices), ImgBB Multi-part Image API |

---

## Local Setup Steps

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd client
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Ensure the following variables are defined:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id
   ```
4. **Start the development server:**
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000`.

---

## Examiner Test Credentials

For quick evaluation, use the test account below or register a new one directly on the site:

- **Examiner Email:** `examiner@studiospace.local`
- **Examiner Password:** `StudioSpace2026!`

---

## Available Client Routes

- `/` — Home (Hero slider, featured studios, categories, 4-step workflow, host guarantee, about us)
- `/studios` — Explore Studios directory with search, category filters, and sorting
- `/studios/[id]` — Studio Specifications, gallery carousel, reviews, and booking modal
- `/add-studio` — Private Host route for listing a new studio with photo upload
- `/my-listings` — Private Host route for managing and deleting owned listings
- `/studios/edit/[id]` — Private Host route for editing an existing studio listing
- `/my-bookings` — Private Guest & Host reservations management with PDF invoices
- `/saved-studios` — Wishlist of bookmarked studio spaces
- `/profile` — Account settings and profile photo customization
- `/login` — Account login with email/password and Google OAuth
- `/register` — Account registration with password validation
