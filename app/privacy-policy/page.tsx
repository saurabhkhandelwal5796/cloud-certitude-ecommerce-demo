import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 text-stone-800 text-left space-y-8">
      <h1 className="text-3xl font-black uppercase tracking-wider text-stone-900">Privacy Policy</h1>
      <p className="text-sm font-light leading-relaxed text-stone-650">
        At Cloud Certitude Fashion, we respect your privacy. This policy describes how we collect, use, protect, and share your personal information when you use our website or make purchases.
      </p>
      <h2 className="text-sm font-bold text-stone-850 uppercase">1. Information Collection</h2>
      <p className="text-xs font-light leading-relaxed text-stone-600">
        We collect info you provide directly, including name, email, phone number, shipping address, and payment information during checkout or subscription events.
      </p>
      <h2 className="text-sm font-bold text-stone-850 uppercase">2. Use of Information</h2>
      <p className="text-xs font-light leading-relaxed text-stone-600">
        Your information is used to process orders, manage accounts, prevent fraud, and deliver relevant collection newsletters or support responses.
      </p>
      <h2 className="text-sm font-bold text-stone-850 uppercase">3. Data Security</h2>
      <p className="text-xs font-light leading-relaxed text-stone-600">
        We implement industry-standard secure socket layers (SSL) and database encryption to ensure data integrity and safeguard your transaction particulars.
      </p>
    </div>
  );
}
