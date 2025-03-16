import type { Metadata } from "next";

import "../styles/globals.css";
import { Footer } from "@/components";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Computer Depot",
  description: "Discover the best 2nd hand texh equipments in the world",
};

export default function RootLayout({
  children,

}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      
      <body className={"relative"}>
        <AuthProvider>
          {children}
          <Footer />
        </AuthProvider>
      </ body>
        
    </html>
  );
}
