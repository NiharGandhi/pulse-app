import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans, Instrument_Serif } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { AIConcierge } from "@/components/ai/AIConcierge";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Pulse — Real-time vibes in Dubai",
  description:
    "Find out what's happening right now at Dubai's best restaurants, cafes, bars and nightlife.",
  icons: {
    icon: [
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon.ico" },
    ],
    apple: "/favicon/apple-touch-icon.png",
    other: [
      { rel: "android-chrome-192x192", url: "/favicon/android-chrome-192x192.png" },
      { rel: "android-chrome-512x512", url: "/favicon/android-chrome-512x512.png" },
    ],
  },
  openGraph: {
    title: "Pulse — Real-time vibes in Dubai",
    description:
      "Find out what's happening right now at Dubai's best restaurants, cafes, bars and nightlife.",
    images: [{ url: "/landing.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pulse — Real-time vibes in Dubai",
    description:
      "Find out what's happening right now at Dubai's best restaurants, cafes, bars and nightlife.",
    images: ["/landing.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${instrumentSerif.variable} ${dmSans.variable}`}
    >
      <body>
        <AuthProvider>
          {children}
          <AIConcierge />
        </AuthProvider>
      </body>
    </html>
  );
}
