import React from "react";
import Link from "next/link";

/**
 * Footer Component
 *
 * Renders the global bottom drawer navigation and brand directories.
 * Designed for warm luxury fashion themes (creams, charcoal, rose gold).
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

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
              <a href="#" className="text-stone-400 hover:text-stone-600 transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.01 3.752.054 2.14.097 3.3 1.2 3.4 3.4.045.968.054 1.322.054 3.752v1.62c0 2.43-.01 2.784-.054 3.752-.097 2.14-1.2 3.3-3.4 3.4-.968.045-1.322.054-3.752.054h-1.62c-2.43 0-2.784-.01-3.752-.054-2.14-.097-3.3-1.2-3.4-3.4-.045-.968-.054-1.322-.054-3.752v-1.62c0-2.43.01-2.784.054-3.752.097-2.14 1.2-3.3 3.4-3.4.968-.045 1.322-.054 3.752-.054h1.62zM12 2.238c-2.39 0-2.721.01-3.66.052-1.91.087-2.62.79-2.7 2.7-.04.94-.05 1.27-.05 3.66v1.62c0 2.39.01 2.721.05 3.66.087 1.91.79 2.62 2.7 2.7.94.04 1.27.05 3.66.05h1.62c2.39 0 2.721-.01 3.66-.05 1.91-.087 2.62-.79 2.7-2.7.04-.94.05-1.27.05-3.66v-1.62c0-2.39-.01-2.721-.05-3.66-.087-1.91-.79-2.62-2.7-2.7-.94-.04-1.27-.05-3.66-.05H12zm0 5.854a3.908 3.908 0 100 7.817 3.908 3.908 0 000-7.817zm0 1.282a2.626 2.626 0 110 5.253 2.626 2.626 0 010-5.253zM16.5 6.5a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                </svg>
              </a>
              {/* Pinterest */}
              <a href="#" className="text-stone-400 hover:text-stone-600 transition-colors">
                <span className="sr-only">Pinterest</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.41 7.61 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.72-.359-1.781c0-1.663.967-2.906 2.17-2.906 1.024 0 1.517.768 1.517 1.686 0 1.02-.647 2.546-.98 3.96-.283 1.196.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.27 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.622 0 11.988-5.365 11.988-11.987C24 5.367 18.633 0 12.017 0z" />
                </svg>
              </a>
              {/* Twitter/X */}
              <a href="#" className="text-stone-400 hover:text-stone-600 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
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
                  {[
                    { name: "Men's Collection", href: "#men" },
                    { name: "Women's Collection", href: "#women" },
                    { name: "Kids' Collection", href: "#kids" },
                    { name: "New Arrivals", href: "#new-arrivals" },
                    { name: "Sales & Discounts", href: "#sale" },
                  ].map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="text-sm text-stone-600 hover:text-[#C68B7D] transition-colors font-light">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500">
                  Customer Care
                </h3>
                <ul role="list" className="mt-4 space-y-3">
                  {[
                    { name: "Help & FAQ", href: "#" },
                    { name: "Shipping & Delivery", href: "#" },
                    { name: "Returns & Exchanges", href: "#" },
                    { name: "Order Tracking", href: "#" },
                    { name: "Contact Support", href: "#" },
                  ].map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="text-sm text-stone-600 hover:text-[#C68B7D] transition-colors font-light">
                        {item.name}
                      </a>
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
                  {[
                    { name: "About Us", href: "#" },
                    { name: "Our Heritage", href: "#" },
                    { name: "Sustainability", href: "#" },
                    { name: "Careers", href: "#" },
                    { name: "Press & Media", href: "#" },
                  ].map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="text-sm text-stone-600 hover:text-[#C68B7D] transition-colors font-light">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500">
                  Legal
                </h3>
                <ul role="list" className="mt-4 space-y-3">
                  {[
                    { name: "Privacy Policy", href: "#" },
                    { name: "Terms & Conditions", href: "#" },
                    { name: "Cookie Settings", href: "#" },
                    { name: "Accessibility", href: "#" },
                  ].map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="text-sm text-stone-600 hover:text-[#C68B7D] transition-colors font-light">
                        {item.name}
                      </a>
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
            <Link href="#" className="hover:text-stone-850 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-stone-850 transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
