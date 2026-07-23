import React from "react";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 text-stone-800 text-left space-y-8">
      <h1 className="text-3xl font-black uppercase tracking-wider text-stone-900">Contact Support</h1>
      <p className="text-sm font-light leading-relaxed text-stone-600">
        Have questions about sizing, delivery, or custom orders? Our dedicated Customer Relations team is here to assist you.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#E0A99E]">Direct Channels</h3>
          <p className="text-sm font-light text-stone-650">
            <strong>Email:</strong> support@cloudcertitudefashion.com<br />
            <strong>Phone:</strong> +91 145 294 5800<br />
            <strong>Hours:</strong> Mon - Sat: 9 AM - 6 PM (IST)
          </p>
        </div>
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#E0A99E]">Atelier Headquarters</h3>
          <p className="text-sm font-light text-stone-650">
            Cloud Certitude Fashion Ltd.<br />
            Adarsh Nagar, Ajmer<br />
            Rajasthan, India (305001)
          </p>
        </div>
      </div>
    </div>
  );
}
