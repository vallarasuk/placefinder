"use client";

import { useEffect } from "react";
import ReactGA from "react-ga4";
import { usePathname } from "next/navigation";

type DataLayerItem = {
  event: string;
  [key: string]: unknown;
};

declare global {
  interface Window {
    dataLayer: DataLayerItem[];
  }
}

const measurementId: string = "G-SKZ1Q8BBSV"; 
const gtmId: string = "GTM-N8N9S2B7";       

const GoogleAnalytics: React.FC = () => {
  const pathname = usePathname(); // Correct hook

  useEffect(() => {
    ReactGA.initialize(measurementId);

    const injectGtmScript = (): void => {
      if (!document.getElementById("gtm-script")) {
        const scriptTag = document.createElement("script");
        scriptTag.id = "gtm-script";
        scriptTag.async = true;
        scriptTag.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
        document.head.appendChild(scriptTag);

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          "gtm.start": new Date().getTime(),
          event: "gtm.js",
        });
      }
    };

    const injectGtmNoScript = (): void => {
      if (!document.getElementById("gtm-noscript")) {
        const noScriptTag = document.createElement("noscript");
        noScriptTag.id = "gtm-noscript";
        noScriptTag.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
        document.body.appendChild(noScriptTag);
      }
    };

    injectGtmScript();
    injectGtmNoScript();
  }, []);

  useEffect(() => {
    // Track page view whenever pathname changes
    ReactGA.send({ hitType: "pageview", page: pathname });
  }, [pathname]);

  return null;
};

export default GoogleAnalytics;
