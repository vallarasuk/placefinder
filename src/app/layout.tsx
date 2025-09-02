// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Logo from "../assest/lo.png";

export const metadata: Metadata = {
  title: "PlaceFinder | Discover the Best Places Near You",
  description:
    "Find restaurants, cafes, and attractions near you with PlaceFinder. Get personalized recommendations and explore new spots instantly.",
  keywords: [
    "places near me",
    "restaurants",
    "cafes",
    "attractions",
    "travel",
    "explore",
    "PlaceFinder",
  ],
  authors: [{ name: "PlaceFinder Team" }],
  metadataBase: new URL("https://placefinder.vallarasuk.com/"),
  alternates: {
    canonical: "https://placefinder.vallarasuk.com/",
  },
  openGraph: {
    title: "PlaceFinder | Discover the Best Places Near You",
    description:
      "Find restaurants, cafes, and attractions near you with PlaceFinder.",
    url: "https://placefinder.vallarasuk.com/",
    siteName: "PlaceFinder",
    images: [
      {
        url: "https://placefinder.vallarasuk.com/og-image.jpg"  ,
        width: 1200,  
        height: 630,
        alt: "Discover the best places near you with PlaceFinder",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PlaceFinder | Discover the Best Places Near You",
    description:
      "Find restaurants, cafes, and attractions near you with PlaceFinder.",
    images: ["https://placefinder.vallarasuk.com/og-image.jpg"], 
    creator: "@vallarasuk",
  },
  icons: {
    icon: Logo.src, 
    shortcut: Logo.src,
    apple: Logo.src,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col overflow-x-hidden antialiased">
        <main className="flex-grow">{children}</main>
      </body>
    </html>
  );
}
