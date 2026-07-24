import type { Metadata } from "next";
import { Figtree, Fraunces } from "next/font/google";
import { SchoolProvider } from "@/lib/store";
import { SCHOOL } from "@/lib/types";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${SCHOOL.shortName} | ${SCHOOL.location}`,
  description: `${SCHOOL.name} — a basic school in ${SCHOOL.area}, ${SCHOOL.location}. ${SCHOOL.tagline}.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${figtree.variable} ${fraunces.variable} h-full`}
    >
      <body className="min-h-full antialiased">
        <SchoolProvider>{children}</SchoolProvider>
      </body>
    </html>
  );
}
