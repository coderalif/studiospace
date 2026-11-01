import "./globals.css";
import { AppProviders } from "../components/AppProviders";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export const metadata = {
  title: "StudioSpace — Make room for your next big idea",
  description:
    "Discover and book distinctive creative studios, production spaces, and places to make something memorable.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        {/* Shared providers, navigation, and footer wrap every route. */}
        <AppProviders>
          <Header />
          <main>{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
