"use client";

/**
 * DynamicBreadcrumbs
 *
 * Renders a breadcrumb trail from navigation ancestors.
 * Example: Home > Men > Clothing > Top Wear > T-Shirts
 *
 * Also emits BreadcrumbList JSON-LD for Google structured data.
 */

import React from "react";
import Link from "next/link";
import type { NavNode } from "@/services/NavigationService";

interface DynamicBreadcrumbsProps {
  ancestors: NavNode[];  // Root → parent (current node excluded)
  current: NavNode;
}

export default function DynamicBreadcrumbs({
  ancestors,
  current,
}: DynamicBreadcrumbsProps) {
  const all = [...ancestors, current];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "/",
      },
      ...all.map((node, idx) => ({
        "@type": "ListItem",
        position: idx + 2,
        name: node.name,
        item: `/${node.fullPath}`,
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav
        aria-label="Breadcrumb"
        className="flex items-center flex-wrap gap-1.5 px-4 md:px-0 py-3 text-xs text-stone-500"
      >
        <Link
          href="/"
          className="hover:text-stone-800 transition-colors font-medium"
        >
          Home
        </Link>

        {ancestors.map((node) => (
          <React.Fragment key={node.id}>
            <span className="text-stone-300 select-none">/</span>
            <Link
              href={`/${node.fullPath}`}
              className="hover:text-stone-800 transition-colors font-medium capitalize"
            >
              {node.name}
            </Link>
          </React.Fragment>
        ))}

        <span className="text-stone-300 select-none">/</span>
        <span className="text-stone-800 font-semibold capitalize">
          {current.name}
        </span>
      </nav>
    </>
  );
}
