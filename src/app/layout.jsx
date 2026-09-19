import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import SmoothScroll from "./components/SmoothScroll";
import NavigationDuck from "./components/NavigationDuck";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "OA Duck | Practice with purpose",
  description: "A focused workspace for better problem-solving practice.",
  icons: {
    icon: "/OADuck.png",
    shortcut: "/OADuck.png",
    apple: "/OADuck.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SmoothScroll />
        <Providers><NavigationDuck />{children}</Providers>
      </body>
    </html>
  );
}
