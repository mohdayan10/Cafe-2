import { Bodoni_Moda, Jost, Yellowtail } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { SITE } from "@/components/site";
import { schemaHours } from "@/components/hours";

const display = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const script = Yellowtail({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

/* The public host is only known at build time. Prefer an explicit
   NEXT_PUBLIC_SITE_URL (set this once you point a real domain at the
   site), then Vercel's stable production domain, then the per-deploy
   URL, and only fall back to the placeholder in site.js. Without this
   every share card and canonical link points at a domain that does
   not exist. */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL &&
    `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  SITE.url;

const DESCRIPTION =
  "An espresso bar, kitchen and pasticceria on the corner — burgers, pasta, pizza and " +
  "pastry, served all day at the nine-metre long table.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE.name} — espresso bar, kitchen & pasticceria`,
    template: `%s · ${SITE.name}`,
  },
  description: DESCRIPTION,
  applicationName: SITE.name,
  keywords: ["cafe", "espresso bar", "coffee", "brunch", SITE.locality, SITE.name],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — espresso bar, kitchen & pasticceria`,
    description: DESCRIPTION,
    url: "/",
    locale: "en_IN",
    images: [{ url: "/brew/01.jpg", width: 2400, height: 1600, alt: `${SITE.name} — single origin coffee` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — espresso bar, kitchen & pasticceria`,
    description: DESCRIPTION,
    images: ["/brew/01.jpg"],
  },
  robots: { index: true, follow: true },
};

/* Structured data: this is what puts the hours, address and phone into a
   search result rather than just a blue link. Hours come from hours.js,
   so they can never disagree with the ones on the page. */
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "CafeOrCoffeeShop",
  name: SITE.name,
  description: DESCRIPTION,
  url: SITE_URL,
  telephone: SITE.phone,
  email: SITE.email,
  image: `${SITE_URL}/brew/01.jpg`,
  servesCuisine: ["Coffee", "Italian", "Breakfast", "Burgers"],
  priceRange: "₹₹",
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.street,
    addressLocality: SITE.locality,
    addressRegion: SITE.region,
    postalCode: SITE.postcode,
    addressCountry: SITE.country,
  },
  openingHoursSpecification: schemaHours(),
  sameAs: [SITE.instagram, SITE.facebook],
  acceptsReservations: true,
};

export const viewport = {
  themeColor: "#FBF3E4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${script.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <Preloader />
        <SmoothScroll />
        <Nav />
        <main id="top">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
