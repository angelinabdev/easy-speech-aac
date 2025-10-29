
import type { Metadata } from "next";
import { PT_Sans } from 'next/font/google'
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { FontSizeProvider } from "@/components/font-size-provider";
import { CalmModeProvider } from "@/components/calm-mode-provider";

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: "Easy Speech AAC | Free Assistive Communication App for Nonverbal Users",
  description: "Easy Speech AAC is a free web-based AAC app designed to help nonverbal and neurodivergent users communicate with ease. Features include a daily planner, mood tracker, customizable soundboard, and gamified learning.",
  openGraph: {
    title: "Easy Speech AAC | Free Assistive Communication App for Nonverbal Users",
    description: "A nonprofit AAC web app helping nonverbal and neurodivergent users communicate using soundboards, mood tracking, gamified tools, and more.",
    url: "https://easyspeechaac.com", // Assuming a production URL, can be updated later
    type: "website",
    images: [
      {
        url: "https://easyspeechaac.com/og-image.png", // Assuming an OG image will be created
        width: 1200,
        height: 630,
        alt: "Easy Speech AAC App Interface",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${ptSans.variable} font-body antialiased flex flex-col min-h-screen`}>
        <Providers>
          <FontSizeProvider>
            <CalmModeProvider>
              <FirebaseClientProvider>
                <div className="flex-grow">{children}</div>
                <Toaster />
              </FirebaseClientProvider>
            </CalmModeProvider>
          </FontSizeProvider>
        </Providers>
      </body>
    </html>
  );
}
