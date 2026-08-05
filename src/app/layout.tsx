import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Libre_Baskerville } from "next/font/google";
import { PWARegister } from "@/components/PWARegister";
import "./globals.css";

const devSwCleanupScript = `
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then(function (regs) {
    regs.forEach(function (reg) { reg.unregister(); });
  });
}
if ("caches" in window) {
  caches.keys().then(function (keys) {
    keys.forEach(function (key) { caches.delete(key); });
  });
}
`;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const libreBaskerville = Libre_Baskerville({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-libre-baskerville",
});

export const metadata: Metadata = {
  title: "Okina",
  description: "Electronic books and AI chat — curated collections for curious minds.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Okina",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F5F1E9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${inter.variable} ${libreBaskerville.variable} h-full`}
    >
      <body className="min-h-full antialiased">
        {process.env.NODE_ENV === "development" ? (
          <Script
            id="dev-sw-cleanup"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{ __html: devSwCleanupScript }}
          />
        ) : null}
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
