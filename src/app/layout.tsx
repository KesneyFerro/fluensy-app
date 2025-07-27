import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ClientLayout from "@/components/client-layout";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "FluenSy - Revolutionizing Speech Therapy",
  description: "Improve your speech and language skills with FluenSy",
  icons: {
    icon: "/fluensy_icon.svg",
    shortcut: "/fluensy_icon.svg",
    apple: "/fluensy_icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/fluensy_icon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/fluensy_icon.svg" />
        <link rel="apple-touch-icon" href="/fluensy_icon.svg" />
      </head>
      <body className={`${poppins.variable} font-sans antialiased`}>
        <AuthProvider>
          <LanguageProvider>
            <ClientLayout>{children}</ClientLayout>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
