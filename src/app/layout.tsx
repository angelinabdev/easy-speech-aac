
import type { Metadata } from "next";
import { PT_Sans } from 'next/font/google'
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/lib/firebase/client-provider";

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: "Easy Speech AAC",
  description: "Your friendly AAC and mood tracking companion.",
  manifest: "/manifest.webmanifest",
  icons: {
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={`${ptSans.variable} font-body antialiased`}>
        <Providers>
          <FirebaseClientProvider>
            {children}
          </FirebaseClientProvider>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
