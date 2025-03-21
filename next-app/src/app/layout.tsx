import type { Metadata } from "next";
// import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import colors from "colors"
import { SettingsProvider } from '@/contexts/SettingsContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Suspense } from 'react'
import GlobalLoading from './loading'
import { Quicksand, Noto_Sans_Thai_Looped } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";

colors.enable()

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

const quicksand = Quicksand({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-quicksand',
});

const notoSansThai = Noto_Sans_Thai_Looped({
  subsets: ['thai'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-noto-thai',
});

export const metadata: Metadata = {
  title: "Fortoon",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${quicksand.variable} ${notoSansThai.variable}`}>
      <body className="font-quicksand [&:lang(th)]:font-noto-thai">
        
          <AuthProvider>
            <SettingsProvider>
              <Suspense fallback={<GlobalLoading />}>
              <Toaster />
              <Navbar />
              {children}
              <Footer />
              </Suspense>
            </SettingsProvider>
          </AuthProvider>
        
      </body>
    </html>
  );
}
