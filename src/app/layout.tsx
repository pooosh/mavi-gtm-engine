import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAVI Trial OS",
  description: "A shared 14-day finance talent trial workspace.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} font-sans`}>
      <body>{children}</body>
    </html>
  );
}
