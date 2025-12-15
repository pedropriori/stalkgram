"use client";

import { useEffect } from "react";

export function ClarityScript() {
  useEffect(() => {
    // Script do Microsoft Clarity
    (function (c: any, l: Document, a: string, r: string, i: string, t: HTMLScriptElement | null, y: HTMLScriptElement | null) {
      c[a] =
        c[a] ||
        function (...args: any[]) {
          (c[a].q = c[a].q || []).push(args);
        };
      t = l.createElement(r) as HTMLScriptElement;
      t.async = true;
      t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0] as HTMLScriptElement;
      if (y && y.parentNode) {
        y.parentNode.insertBefore(t, y);
      } else {
        l.head.appendChild(t);
      }
    })(window, document, "clarity", "script", "um22xsmxuc", null, null);
  }, []);

  return null;
}

