import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import 'primeicons/primeicons.css';

const Footer = () => {
  const [showFooter, setShowFooter] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const handleRouteChange = () => {
      setShowFooter(false); // Sayfa değişince yeniden gizle
      timer = setTimeout(() => {
        setShowFooter(true); // 2 saniye sonra göster
      }, 2000);
    };

    // İlk yükleme için
    handleRouteChange();

    // Route değişimini dinle
    router.events.on("routeChangeComplete", handleRouteChange);

    // Temizlik
    return () => {
      clearTimeout(timer);
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  if (!showFooter) return null;

  return (
    <footer className="text-black-100 mt-5 border-t border-gray-200 bg-gray-50">
      <div className="flex max-md:flex-col flex-wrap justify-between gap-10 sm:px-16 px-6 py-12 pl-24">
        <div className="flex flex-col justify-start items-start gap-6">
          <p className="text-base text-gray-700 pl-10">
            Computer Depot {new Date().getFullYear()} <br />
            All rights reserved &copy;
          </p>
        </div>
        <div className="flex-1 w-full flex md:justify-end flex-wrap max-md:mt-10 gap-10 md:gap-20">
          <div className="footer__link-section">
            <h3 className="font-semibold text-gray-900 mb-3">About Us</h3>
            <Link href="/about" className="text-gray-500 hover:text-gray-800 block mb-2">About Us</Link>
          </div>
          <div className="footer__link-section">
            <h3 className="font-semibold text-gray-900 mb-3">Security</h3>
            <Link href="/careers" className="text-gray-500 hover:text-gray-800 block mb-2">Security in Computer Depot</Link>
          </div>
          <div className="footer__link-section">
            <h3 className="font-semibold text-gray-900 mb-3">Sustainability</h3>
            <Link href="/sustainability" className="text-gray-500 hover:text-gray-800 block mb-2">Our Principles</Link>
          </div>
          <div className="footer__link-section">
            <h3 className="font-semibold text-gray-900 mb-3">Social Media</h3>
            <div className="flex items-center gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600">
                <i className="pi pi-facebook" style={{ fontSize: '1.5rem' }}></i>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-red-600">
                <i className="pi pi-youtube" style={{ fontSize: '1.5rem' }}></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-pink-600">
                <i className="pi pi-instagram" style={{ fontSize: '1.5rem' }}></i>
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black">
                <i className="pi pi-twitter" style={{ fontSize: '1.5rem' }}></i>
              </a>
            </div>
            <div className="mt-4 text-sm">
              <Link href="/privacy" className="text-gray-500 hover:text-gray-800 mr-4">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-gray-800">
                Terms of Use
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
