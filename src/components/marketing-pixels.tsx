'use client';

import Script from 'next/script';
import type { SiteSettingsMap } from '@/lib/settings';

export default function MarketingPixels({ settings = {} }: { settings?: SiteSettingsMap }) {
  const fbId = settings.facebook_pixel_id;
  const tiktokId = settings.tiktok_pixel_id;
  const gaId = settings.google_analytics_id;

  return (
    <>
      {/* Facebook Pixel */}
      {fbId && (
        <>
          <Script
            id="fb-pixel"
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
                fbq('init', '${fbId}');
                fbq('track', 'PageView');
              `,
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${fbId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {/* TikTok Pixel */}
      {tiktokId && (
        <Script
          id="tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TTAQ=w.TTAQ||[];
                w.ttq=w.ttq||[];w.ttq._i=w.ttq._i||{};w.ttq._f=w.ttq._f||{};w.ttq._o=w.ttq._o||{};w.ttq._s=w.ttq._s||{};
                w.ttq._d=w.ttq._d||[];w.ttq._t=w.ttq._t||{};w.ttq._e=w.ttq._e||[];w.ttq._c=w.ttq._c||{};w.ttq._j=w.ttq._j||{};
                w.ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
                w.ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
                for(var e=0;e<w.ttq.methods.length;e++)w.ttq.setAndDefer(w.ttq,w.ttq.methods[e]);
                w.ttq.instance=function(t){for(var e=w.ttq._i[t]||[],n=0;n<w.ttq.methods.length;n++)w.ttq.setAndDefer(e,w.ttq.methods[n]);return e};
                w.ttq.load=function(e,n){var t="https://analytics.tiktok.com/i18n/pixel/events.js";w.ttq._i=w.ttq._i||{};w.ttq._i[e]=[];
                w.ttq._i[e]._u=t;w.ttq._t=w.ttq._t||{};w.ttq._t[e]=+new Date;w.ttq._o=w.ttq._o||{};w.ttq._o[e]=n||{};
                var o=d.createElement("script");o.type="text/javascript";o.async=!0;o.src=t;
                var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                
                w.ttq.load('${tiktokId}');
                w.ttq.page();
              }(window, document, 'script');
            `,
          }}
        />
      )}

      {/* Google Analytics (gtag.js) */}
      {gaId && (
        <>
          <Script
            id="ga-src"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          />
          <Script
            id="ga-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `,
            }}
          />
        </>
      )}
    </>
  );
}
