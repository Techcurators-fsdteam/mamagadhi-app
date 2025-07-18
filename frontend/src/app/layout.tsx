import "./globals.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mamagaadi",
  description: "Mamagaadi - Community Transport Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="w-full min-h-full">
      <body className={geist.className + " min-h-screen w-full antialiased"}>
        {children}
      </body>
    </html>
  );
}
