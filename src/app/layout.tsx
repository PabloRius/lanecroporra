import { FloatingMenu } from "@/components/floating-menu";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "La Necroporra - El Reto Anual más Controvertido",
  description:
    "Únete al reto viral de España. Crea tu lista de famosos y compite con tus amigos en La Necroporra.",
  keywords: [
    "Necroporra",
    "Reto viral",
    "España",
    "Juego anual",
    "Lista de famosos",
    "Competencia",
    "Apuestas divertidas",
  ],
  authors: [
    { name: "Pablo Garcia Rius", url: "https://pablogrius.com" },
    // { name: "La Necroporra", url: "https://lanecrporra.com" },
  ],
  metadataBase: new URL("https://lanecrporra.com"),
  openGraph: {
    title: "La Necroporra - El Reto Anual más Controvertido",
    description:
      "Únete al reto viral de España. Crea tu lista de famosos y compite con tus amigos en La Necroporra.",
    url: "https://lanecrporra.com",
    siteName: "La Necroporra",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Logo de La Necroporra",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "La Necroporra - El Reto Anual más Controvertido",
    description:
      "Únete al reto viral de España. Crea tu lista de famosos y compite con tus amigos en La Necroporra.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
  robots: {
    index: true,
    follow: true,
  },
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
  --font-serif: ${playfair.variable};
}
        `}</style>
      </head>
      <body
        className={
          playfair.variable +
          " flex flex-col gap-4 min-h-screen bg-white dark:bg-black transition-colors duration-300"
        }
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <FloatingMenu />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
