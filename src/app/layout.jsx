import { Geist_Mono, Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import SmoothScroll from "./components/SmoothScroll";
import NavigationDuck from "./components/NavigationDuck";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
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
      className={`${manrope.variable} ${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">
        <SmoothScroll />
        <Providers><NavigationDuck />{children}</Providers>
      </body>
    </html>
  );
}
