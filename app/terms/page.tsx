import React from "react";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 text-stone-800 text-left space-y-8">
      <h1 className="text-3xl font-black uppercase tracking-wider text-stone-900">Terms & Conditions</h1>
      <p className="text-sm font-light leading-relaxed text-stone-650">
        Please read these Terms and Conditions carefully before purchasing from or using the Cloud Certitude Fashion platform.
      </p>
      <h2 className="text-sm font-bold text-stone-850 uppercase">1. General Conditions</h2>
      <p className="text-xs font-light leading-relaxed text-stone-600">
        By accessing this website, you agree to comply with all local laws and acknowledge that all product catalogs and brand marks are copyrighted intellectual assets.
      </p>
      <h2 className="text-sm font-bold text-stone-850 uppercase">2. Purchases & Payment</h2>
      <p className="text-xs font-light leading-relaxed text-stone-600">
        All orders are subject to acceptance and catalog availability. We reserve the right to correct pricing errors or cancel transactions violating security algorithms.
      </p>
      <h2 className="text-sm font-bold text-stone-850 uppercase">3. Limitation of Liability</h2>
      <p className="text-xs font-light leading-relaxed text-stone-600">
        Cloud Certitude Fashion is not liable for indirect shipping delays, database outages, or third-party bank gateway failures during card checkouts.
      </p>
    </div>
  );
}
