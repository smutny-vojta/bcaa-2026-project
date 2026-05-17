import type { Metadata } from "next";
import { Inter, Figtree } from "next/font/google";
import "./globals.css";
import { cn } from "@/shared/utils/cn";
import Navbar from "@/shared/components/navbar";
import { Toaster } from "@/shared/components/ui/sonner";
import DataResolver from "../shared/components/data-resolver";

const inter = Inter({ subsets: ["latin"], variable: "--font-heading" });

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "TrackTrack",
  description: "A simple webb app to track delays in public transportation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="cs"
      className={cn(
        "h-full",
        "antialiased",
        "font-sans",
        figtree.variable,
        inter.variable,
      )}
    >
      <body className="min-h-full flex flex-col items-center">
        <Toaster
          theme="light"
          position="top-center"
          richColors
          expand
          closeButton
          className="z-9999"
        />
        <Navbar />
        <div className="flex-1 container py-4 flex flex-col gap-y-4">
          <DataResolver>{children}</DataResolver>
        </div>
      </body>
    </html>
  );
}
