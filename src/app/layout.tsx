import { cn } from "@/utils/cn";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Scrape and extract",
  description:
    "Scrape a website of your choice by entering the URL and specifying selectors to extract your desired data.",
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
