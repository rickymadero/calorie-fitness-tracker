import type { Metadata, Viewport } from "next";
import { DM_Sans, Sora } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Evolve",
  description:
    "The social fitness network — share workouts, follow athletes, and grow together.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Evolve",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f4f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0d10" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sora.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full overflow-x-clip font-sans text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
