// app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Head from 'next/head'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CompareMyParkings | Find the Best Deals | Compare Airport Parking",
  description: "Easily compare and book affordable airport parking at all major UK airports. Save time and money with CompareMyParkings.",
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.png", 
      apple: "/favicon.png", 
    },
  keywords: [
    "compare airport parking",
    "cheap airport parking",
    "UK airport parking",
    "airport parking deals",
    "meet and greet parking comparison",
    "park and ride comparison"
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}

        {/* Schema Markup for CompareMyParkings */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "CompareMyParkings UK",
            "url": "https://comparemyparkings.co.uk",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://comparemyparkings.co.uk/search?q={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "CompareMyParkings UK",
            "description": "Airport parking comparison service for major UK airports.",
            "url": "https://comparemyparkings.co.uk",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "London", // Assuming a general location for now
              "addressCountry": "UK"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8", // Example rating, update with actual
              "reviewCount": "1200" // Example count, update with actual
            },
            "serviceType": "Airport Parking Comparison"
          })}
        </script>
      </body>
    </html>
  );
}