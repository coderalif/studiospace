# StudioSpace — Peer-to-Peer Creative Workspace & Production Studio Sharing Platform

StudioSpace is a peer-to-peer marketplace for creative studios and production spaces. This repository includes the Express/MongoDB API and a responsive Next.js client.

**Local website:** `http://localhost:3000` (available while the frontend dev server is running).
**Live client:** https://studiospace-pearl.vercel.app
**Live API:** https://studiospace-j8pk.vercel.app/api

## Features

- Register and log in with email/password; authenticate protected routes using an HTTP-only JWT cookie.
- Verify Google ID tokens and create or sign in to a user account.
- Create, browse, search, update, and delete studio listings, with owner-only changes.
- View six featured studios and studio details, including host and review information.
- Upload studio images to ImgBB through the API.
- Create bookings, view a user's bookings, and let hosts confirm or update booking status.
- Check confirmed bookings for overlapping time slots before creating or confirming a reservation.
- Keep secrets in environment variables rather than source files.
- Browse a responsive creative-space directory and manage host listings from the Next.js client.
- Switch between light and dark themes.
- Save favorite studios to a personal wishlist and download PDF invoices for confirmed bookings.
- Update the signed-in user's profile photo from account settings.

## Technology

- Node.js 18 or newer, Express 5, and JavaScript.
- MongoDB with Mongoose.
- JWT cookies, bcryptjs, Google ID token verification, and ImgBB image hosting.
- Next.js App Router, React, Swiper carousels, Lucide icons, and Sonner toast notifications.

## Where the code lives

- `src/server.js` starts the API after checking configuration and connecting to MongoDB.
- `src/models/` defines the account, studio, and booking data stored in MongoDB.
- `src/routes/` contains the API endpoints for authentication, studios, bookings, and image uploads.
- `src/middleware/` checks login sessions and returns consistent API errors.
- `src/scripts/seedDemo.js` adds a local-only examiner account and example studios.
- `client/app/` contains the website pages and shared responsive theme styles.
- `client/components/` contains reusable navigation, listing forms, and other interface pieces.
- `client/lib/` contains the API helper and shared form/category data.

## Local setup

1. Install Node.js 18+ and make sure MongoDB is available locally or through MongoDB Atlas.
2. Copy `.env.example` to `.env`.
3. Set `MONGODB_URI` and replace `JWT_SECRET` with a long, random value. Set `CLIENT_URL` to the client origin. The example uses a local MongoDB database.
4. For Google sign-in, set `GOOGLE_CLIENT_ID`. For image uploads, set `IMGBB_API_KEY`.
5. Install backend dependencies from the project root using `npm install`.
6. Install frontend dependencies with `npm --prefix client install`.
7. Copy `client/.env.example` to `client/.env.local`. Set the API URL and, if enabled, the public Google client ID.
8. Start the API with `npm run dev`. The default address is `http://localhost:5000`.
9. In a second terminal, start the website with `npm --prefix client run dev`. Open `http://localhost:3000`.
10. Check `http://localhost:5000/api/health` for the API health response.

For a client hosted on a different site, configure `COOKIE_SAME_SITE=none` and `COOKIE_SECURE=true` over HTTPS. Keep those cookie settings and all API secrets in the hosting provider's environment settings.
For local development, the API's `CLIENT_URL` should include `http://localhost:3000`.

For the deployed Vercel client, `NEXT_PUBLIC_API_URL` is set to `https://studiospace-j8pk.vercel.app/api`. To enable Google sign-in, set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in the Vercel client project's Production environment and `GOOGLE_CLIENT_ID` in the API project's environment to the same Google OAuth Web client ID, then redeploy both projects. Add `https://studiospace-pearl.vercel.app` to that OAuth client's authorized JavaScript origins.

## Main API routes

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Create an account |
| POST | `/api/auth/login` | Public | Log in and set the auth cookie |
| POST | `/api/auth/google` | Public | Sign in with a Google ID token |
| POST | `/api/auth/logout` | Public | Clear the auth cookie |
| GET | `/api/auth/me` | Logged in | Return the current user |
| PATCH | `/api/auth/profile` | Logged in | Update the current user's profile photo URL |
| GET | `/api/studios/featured` | Public | Return up to six featured studios |
| GET | `/api/studios/saved` | Logged in | List the current user's saved studios |
| PUT | `/api/studios/:id/saved` | Logged in | Save a studio to the wishlist |
| DELETE | `/api/studios/:id/saved` | Logged in | Remove a studio from the wishlist |
| GET | `/api/studios` | Public | Browse, filter, and search studios |
| GET | `/api/studios/:id` | Public | Read studio details |
| POST | `/api/studios` | Logged in | Create a listing |
| GET | `/api/studios/mine` | Logged in | List the current user's studio listings |
| PATCH | `/api/studios/:id` | Listing owner | Update a listing |
| DELETE | `/api/studios/:id` | Listing owner | Delete a listing without future active bookings |
| POST | `/api/studios/:id/reviews` | Eligible guest | Review a studio after a completed booking |
| POST | `/api/uploads` | Logged in | Upload an image using multipart field `image` |
| POST | `/api/bookings` | Logged in | Request a booking |
| GET | `/api/bookings/mine` | Logged in | List the current user's bookings |
| GET | `/api/bookings/:id/invoice` | Booking guest | Download a PDF invoice after confirmation |
| GET | `/api/bookings/host` | Logged in | List bookings for the current host's studios |
| PATCH | `/api/bookings/:id/status` | Studio host | Confirm, complete, or cancel a booking |
| PATCH | `/api/bookings/:id/cancel` | Booking guest | Cancel a pending booking |

Studio browsing accepts `category`, `location`, `search`, `page`, and `limit` query parameters. Booking times must be ISO date strings.

## Examiner test account

The live deployment is available at the client and API URLs listed above. To create a local examiner account and six sample studios, run `npm run seed:demo` from the project root while `NODE_ENV=development` and MongoDB are configured. The command refuses to run in production.

- Examiner email: `examiner@studiospace.local`
- Examiner password: `StudioSpace2026!`

These are local demo credentials only. Never reuse this password for a real account.
