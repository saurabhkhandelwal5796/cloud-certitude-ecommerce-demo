"use client";

import React, { useState } from "react";
import Link from "next/link";

/**
 * Footer Component
 *
 * Renders the global bottom drawer navigation and brand directories.
 * Designed for warm luxury fashion themes (creams, charcoal, rose gold).
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const getModalDetails = () => {
    switch (activeModal) {
      case "faq":
        return {
          title: "Help & FAQ",
          content: (
            <div className="space-y-4">
              <div>
                <h4 className="font-extrabold text-stone-900 text-xs uppercase tracking-wider">How can I track my order?</h4>
                <p className="text-xs text-stone-500 font-light mt-1.5 leading-relaxed">Once shipped, you can find your tracking details under the orders section of your profile.</p>
              </div>
              <div>
                <h4 className="font-extrabold text-stone-900 text-xs uppercase tracking-wider">What payment methods do you accept?</h4>
                <p className="text-xs text-stone-500 font-light mt-1.5 leading-relaxed">We accept major Credit/Debit Cards, Net Banking, UPI Payments, and Cash on Delivery.</p>
              </div>
              <div>
                <h4 className="font-extrabold text-stone-900 text-xs uppercase tracking-wider">Are your fabrics organic?</h4>
                <p className="text-xs text-stone-500 font-light mt-1.5 leading-relaxed">Yes, all our garments use GOTS certified organic cotton or premium recycled textiles.</p>
              </div>
            </div>
          )
        };
      case "shipping":
        return {
          title: "Shipping & Delivery",
          content: (
            <div className="space-y-4 text-xs font-light text-stone-600 leading-relaxed">
              <p>We offer three primary delivery lanes for your convenience:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Standard Delivery:</strong> Free of charge. Arrives in 5 business days.</li>
                <li><strong>Express Delivery:</strong> ₹150 flat rate. Arrives in 2 business days.</li>
                <li><strong>Sameday Delivery:</strong> ₹350 flat rate. Order before 12 PM for same-day delivery.</li>
              </ul>
              <p className="mt-2">All shipping packages are ethically wrapped in biodegradable, plastic-free material.</p>
            </div>
          )
        };
      case "returns":
        return {
          title: "Returns & Exchanges",
          content: (
            <div className="space-y-4 text-xs font-light text-stone-600 leading-relaxed">
              <p>If you are not entirely satisfied with your apparel fit, we offer a hassle-free return and exchange policy:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Return requests must be initiated within 14 days of delivery.</li>
                <li>Items must remain unworn, unwashed, and with all original tags attached.</li>
                <li>Refunds are credited directly to your payment source within 5-7 business days.</li>
              </ul>
            </div>
          )
        };
      case "cookies":
        return {
          title: "Cookie Settings",
          content: (
            <div className="space-y-4 text-xs font-light text-stone-600 leading-relaxed">
              <p>We use essential cookies to manage your shopping cart state, maintain security sessions, and analyze anonymous traffic data.</p>
              <p>By using our Atelier platform, you consent to our standard cookie policy. You can disable non-essential profiling cookies in your browser settings at any time.</p>
            </div>
          )
        };
      case "accessibility":
        return {
          title: "Accessibility Statement",
          content: (
            <div className="space-y-4 text-xs font-light text-stone-600 leading-relaxed">
              <p>Cloud Certitude Fashion is dedicated to providing a platform accessible to everyone, regardless of technology or ability.</p>
              <p>We actively work to conform our shopping flow to WCAG 2.1 Level AA standards. If you encounter any structural hurdles, please contact our accessibility support line.</p>
            </div>
          )
        };
      default:
        return null;
    }
  };

  const modalData = getModalDetails();

  interface FooterItem {
    name: string;
    href?: string;
    action?: () => void;
  }

  const shopItems: FooterItem[] = [
    { name: "Men's Collection", href: "/men" },
    { name: "Women's Collection", href: "/women" },
    { name: "Kids' Collection", href: "/kids" },
    { name: "New Arrivals", href: "/new-arrivals" },
    { name: "Sales & Discounts", href: "/sale" },
  ];

  const customerCareItems: FooterItem[] = [
    { name: "Help & FAQ", action: () => setActiveModal("faq") },
    { name: "Shipping & Delivery", action: () => setActiveModal("shipping") },
    { name: "Returns & Exchanges", action: () => setActiveModal("returns") },
    { name: "Order Tracking", href: "/orders" },
    { name: "Contact Support", href: "/contact" },
  ];

  const companyItems: FooterItem[] = [
    { name: "About Us", href: "/about-us" },
    // { name: "Sustainability", href: "/about-us" },
  ];

  const legalItems: FooterItem[] = [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Cookie Settings", action: () => setActiveModal("cookies") },
    { name: "Accessibility", action: () => setActiveModal("accessibility") },
  ];

  return (
    <footer className="border-t border-stone-200/60 bg-[#FAF9F6] text-stone-800 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand Bio */}
          <div className="space-y-6">
            <span className="text-lg font-black tracking-widest uppercase flex items-center gap-1.5 text-stone-850">
              Cloud <span className="text-[#E0A99E] font-light">Certitude</span> Fashion
            </span>
            <p className="text-sm text-stone-600 max-w-md leading-relaxed font-light">
              Redefining contemporary style with ethically sourced premium garments. Experience timeless luxury designs tailored for modern individuals.
            </p>
            <div className="flex space-x-5">
              {/* Instagram */}
              {/* <a href="#" className="text-stone-400 hover:text-stone-600 transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.01 3.752.054 2.14.097 3.3 1.2 3.4 3.4.045.968.054 1.322.054 3.752v1.62c0 2.43-.01 2.784-.054 3.752-.097 2.14-1.2 3.3-3.4 3.4-.968.045-1.322.054-3.752.054h-1.62c-2.43 0-2.784-.01-3.752-.054-2.14-.097-3.3-1.2-3.4-3.4-.045-.968-.054-1.322-.054-3.752v-1.62c0-2.43.01-2.784.054-3.752.097-2.14 1.2-3.3 3.4-3.4.968-.045 1.322-.054 3.752-.054h1.62zM12 2.238c-2.39 0-2.721.01-3.66.052-1.91.087-2.62.79-2.7 2.7-.04.94-.05 1.27-.05 3.66v1.62c0 2.39.01 2.721.05 3.66.087 1.91.79 2.62 2.7 2.7.94.04 1.27.05 3.66.05h1.62c2.39 0 2.721-.01 3.66-.05 1.91-.087 2.62-.79 2.7-2.7.04-.94.05-1.27.05-3.66v-1.62c0-2.39-.01-2.721-.05-3.66-.087-1.91-.79-2.62-2.7-2.7-.94-.04-1.27-.05-3.66-.05H12zm0 5.854a3.908 3.908 0 100 7.817 3.908 3.908 0 000-7.817zm0 1.282a2.626 2.626 0 110 5.253 2.626 2.626 0 010-5.253zM16.5 6.5a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                </svg>
              </a> */}
              {/* Pinterest */}
              {/* <a href="#" className="text-stone-400 hover:text-stone-600 transition-colors">
                <span className="sr-only">Pinterest</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.41 7.61 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.72-.359-1.781c0-1.663.967-2.906 2.17-2.906 1.024 0 1.517.768 1.517 1.686 0 1.02-.647 2.546-.98 3.96-.283 1.196.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.27 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.622 0 11.988-5.365 11.988-11.987C24 5.367 18.633 0 12.017 0z" />
                </svg>
              </a> */}
              {/* Twitter/X */}
              {/* <a href="#" className="text-stone-400 hover:text-stone-600 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a> */}
            </div>
          </div>

          {/* Directory Listings */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500">
                  Shop
                </h3>
                <ul role="list" className="mt-4 space-y-3">
                  {shopItems.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href || "#"} className="text-sm text-stone-600 hover:text-[#C68B7D] transition-colors font-light">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500">
                  Customer Care
                </h3>
                <ul role="list" className="mt-4 space-y-3">
                  {customerCareItems.map((item) => (
                    <li key={item.name}>
                      {item.href ? (
                        <Link href={item.href || "#"} className="text-sm text-stone-600 hover:text-[#C68B7D] transition-colors font-light text-left">
                          {item.name}
                        </Link>
                      ) : (
                        <button
                          onClick={item.action}
                          className="text-sm text-stone-600 hover:text-[#C68B7D] transition-colors font-light text-left focus:outline-none cursor-pointer"
                        >
                          {item.name}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500">
                  Company
                </h3>
                <ul role="list" className="mt-4 space-y-3">
                  {companyItems.map((item) => (
                    <li key={item.name}>
                      {item.href && item.href !== "#" ? (
                        <Link href={item.href || "#"} className="text-sm text-stone-600 hover:text-[#C68B7D] transition-colors font-light">
                          {item.name}
                        </Link>
                      ) : (
                        <button
                          onClick={item.action}
                          className="text-sm text-stone-600 hover:text-[#C68B7D] transition-colors font-light text-left focus:outline-none cursor-pointer"
                        >
                          {item.name}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500">
                  Legal
                </h3>
                <ul role="list" className="mt-4 space-y-3">
                  {legalItems.map((item) => (
                    <li key={item.name}>
                      {item.href ? (
                        <Link href={item.href || "#"} className="text-sm text-stone-600 hover:text-[#C68B7D] transition-colors font-light">
                          {item.name}
                        </Link>
                      ) : (
                        <button
                          onClick={item.action}
                          className="text-sm text-stone-600 hover:text-[#C68B7D] transition-colors font-light text-left focus:outline-none cursor-pointer"
                        >
                          {item.name}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Legal and Copyright footer bar */}
        <div className="mt-12 border-t border-stone-200/60 pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-xs text-stone-500">
            &copy; {currentYear} Cloud Certitude Fashion. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-stone-500">
            <Link href="/privacy-policy" className="hover:text-stone-850 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-stone-850 transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>

      {/* Informational Modal Overlay */}
      {modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-stone-200/50 bg-white/95 p-6 shadow-2xl backdrop-blur-md text-left">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
              title="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-900 border-b border-stone-105 pb-3 mb-4">
              {modalData.title}
            </h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {modalData.content}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
