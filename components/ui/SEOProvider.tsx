"use client";

import React, { useEffect } from "react";
import Script from "next/script";

export default function SEOProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Analytics initialization placeholders
    console.log("[Analytics] Initialized Google Analytics (GA4) placeholder");
    console.log("[Analytics] Initialized Google Tag Manager (GTM) placeholder");
    console.log("[Analytics] Initialized Meta Pixel (Facebook Pixel) placeholder");
  }, []);

  return (
    <>
      {/* Google Analytics Placeholder */}
      <Script
        id="google-analytics-placeholder"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-MOCK-MEASURE-ID');
          `,
        }}
      />

      {/* Google Tag Manager Placeholder */}
      <Script
        id="gtm-placeholder"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-MOCK-ID');
          `,
        }}
      />

      {/* Meta Pixel Placeholder */}
      <Script
        id="meta-pixel-placeholder"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', 'MOCK-PIXEL-ID');
            fbq('track', 'PageView');
          `,
        }}
      />

      {children}
    </>
  );
}
