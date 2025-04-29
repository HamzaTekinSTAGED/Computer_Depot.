import type { AppProps } from 'next/app';
import "../styles/globals.css";
import { Footer } from "@/components";
import AuthProvider from "@/components/AuthProvider";
import Head from 'next/head';

// Note: The metadata object from layout.tsx needs to be handled differently.
// You might use Head component here or per-page.
// export const metadata: Metadata = { ... }; // This doesn't work directly in _app.tsx

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        {/* Set default head tags here, e.g., title, viewport */}
        <title>Computer Depot</title>
        <meta name="description" content="Discover the best 2nd hand tech equipments in the world" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Add other head tags as needed */}
      </Head>
      {/* The className="relative" was on the body tag, might need to apply elsewhere if needed */}
      <AuthProvider>
        <Component {...pageProps} />
        <Footer />
      </AuthProvider>
    </>
  );
}

export default MyApp;
