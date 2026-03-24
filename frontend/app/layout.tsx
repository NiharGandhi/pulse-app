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
