import type { Metadata } from "next";

import "../styles/globals.css";
import { Footer, Navbar } from "@/components";



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
        {children}
        <Footer />
      </ body>
        
    </html>
  );
}
