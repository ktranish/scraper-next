import { cn } from "@/utils/cn";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Effortlessly Scrape Websites",
  description:
    "Discover how our application simplifies scraping HTML content from any specified URL, providing you with the data you need in no time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "bg-stone-50")}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
