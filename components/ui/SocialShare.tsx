"use client";

import React, { useState } from "react";

interface SocialShareProps {
  url: string;
  title: string;
}

export default function SocialShare({ url, title }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-2.5 text-left border-t border-stone-100 pt-5 mt-5">
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400">
        Share Masterpiece
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {/* Facebook */}
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-8 px-3.5 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-[10px] font-extrabold uppercase tracking-wider text-stone-600 items-center justify-center transition-colors shadow-sm"
        >
          Facebook
        </a>

        {/* X */}
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-8 px-3.5 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-[10px] font-extrabold uppercase tracking-wider text-stone-600 items-center justify-center transition-colors shadow-sm"
        >
          Share on X
        </a>

        {/* LinkedIn */}
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-8 px-3.5 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-[10px] font-extrabold uppercase tracking-wider text-stone-600 items-center justify-center transition-colors shadow-sm"
        >
          LinkedIn
        </a>

        {/* Copy Link */}
        <button
          type="button"
          onClick={handleCopyLink}
          className={`flex h-8 px-3.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider items-center justify-center transition-colors shadow-sm cursor-pointer ${
            copied
              ? "bg-emerald-600 text-white border-emerald-600"
              : "border-stone-200 bg-stone-900 text-white hover:bg-stone-850"
          }`}
        >
          {copied ? "Link Copied! ✓" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}
