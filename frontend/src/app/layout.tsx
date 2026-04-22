import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "SMT | Smart Mining Ecosystem",
  description: "GPU-based dynamic mining system and BEP-20 reward platform.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased w-full h-full min-h-screen relative overflow-x-hidden">
        {/* Animated background glow */}
        <div className="fixed top-0 inset-x-0 h-[500px] w-full bg-gradient-to-b from-[#8b5cf6]/20 to-transparent pointer-events-none -z-10 blur-3xl"></div>
        {children}
      </body>
    </html>
  );
}
