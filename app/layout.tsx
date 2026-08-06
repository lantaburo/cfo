import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-plus-jakarta-sans'
});

export const metadata: Metadata = {
  title: "Finsight Pro - Sharia AI CFO",
  description: "Your personal AI Chief Financial Officer. 100% Sharia Compliant.",
};

import Navbar from './components/Navbar';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={plusJakartaSans.className}>
        <Navbar />
        
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
