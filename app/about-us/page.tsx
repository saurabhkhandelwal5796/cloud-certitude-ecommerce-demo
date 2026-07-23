import React from "react";

export default function AboutUsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 text-stone-800 text-left space-y-8">
      <h1 className="text-3xl font-black uppercase tracking-wider text-stone-900">About Us</h1>
      <p className="text-sm font-light leading-relaxed text-stone-600">
        Welcome to Cloud Certitude Fashion. Established with a vision to merge contemporary elegance with sustainable practices, we handcraft premium fashion garments using 100% certified organic cotton, recycled cashmeres, and responsibly sourced Italian leathers.
      </p>
      <h2 className="text-lg font-bold text-stone-850 uppercase">Our Philosophy</h2>
      <p className="text-sm font-light leading-relaxed text-stone-600">
        We believe that luxury shouldn't compromise the planet. Every piece in our collection is curated to lower our ecological footprint while providing our global clientele with prestige, comfort, and uncompromising tailoring.
      </p>
      <h2 className="text-lg font-bold text-stone-850 uppercase">Ethical Production</h2>
      <p className="text-sm font-light leading-relaxed text-stone-600">
        From farm to wardrobe, we prioritize fair wages, safe working environments, and zero toxic dyes. We are proud to partner with artisan mills and workshops that share our commitment to conscious luxury.
      </p>
    </div>
  );
}
