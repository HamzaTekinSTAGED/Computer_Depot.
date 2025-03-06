import Link from "next/link";
const Footer = () => {
  return <footer className="flex flex-col text-black-100 mt-5 border-t border-gray-100">
    <div className="flex max-md:flex-col flex-wrap justify-between gap-5 sm:px-16 px-6 py-10">
      <div className="flex flex-col justify-start items-start gap-6">
      <p className="text-base text-gray-700">
        Computer Depot 2025 <br />
        All rights reserved &copy;
      </p>
      
      </div>
      <div className="footer__links">
        <Link href="/" className="text-gray-500">
            Privacy Policy
          </Link>
          <Link href="/" className="text-gray-500">
            Terms of Use
          </Link> 

      </div>
    
    </div> 
    </footer>;
};

export default Footer;
