"use client";

import { useEffect, useState } from "react";
import { getPixelStatus, waitForUtmifyPixel, retryPendingEvents } from "../lib/utmify-tracker";

const IS_DEV = process.env.NODE_ENV === "development";

/**
 * Componente de monitoramento do pixel Utmify
 * Verifica se o pixel está funcionando corretamente e exibe status (apenas em dev)
 */
export function UtmifyMonitor() {
  const [status, setStatus] = useState<ReturnType<typeof getPixelStatus> | null>(null);
  const [isDev] = useState(IS_DEV);

  useEffect(() => {
    if (!isDev || typeof window === "undefined") return;

    const checkStatus = () => {
      const currentStatus = getPixelStatus();
      setStatus(currentStatus);

      if (!currentStatus.loaded) {
        console.warn("[Utmify Monitor] Pixel não está carregado:", {
          scriptExists: currentStatus.scriptExists,
          pixelIdCorrect: currentStatus.pixelIdCorrect,
          utmifyApiAvailable: currentStatus.utmifyApiAvailable,
        });
      } else {
        console.log("[Utmify Monitor] ✓ Pixel está funcionando corretamente");
      }
    };

    // Verificar imediatamente
    checkStatus();

    // Aguardar o pixel carregar e verificar novamente
    waitForUtmifyPixel(10000).then((loaded) => {
      checkStatus();
      if (loaded) {
        console.log("[Utmify Monitor] ✓ Pixel carregado com sucesso");
        // Tentar reenviar eventos pendentes
        retryPendingEvents();
      } else {
        console.error("[Utmify Monitor] ✗ Pixel não carregou após 10 segundos");
      }
    });

    // Verificar periodicamente (a cada 5 segundos)
    const interval = setInterval(checkStatus, 5000);

    // Monitorar eventos do pixel
    const handlePixelLoaded = () => {
      console.log("[Utmify Monitor] Evento: pixel carregado");
      checkStatus();
      retryPendingEvents();
    };

    const handlePixelError = () => {
      console.error("[Utmify Monitor] Evento: erro no pixel");
      checkStatus();
    };

    window.addEventListener("utmify:pixel:loaded", handlePixelLoaded);
    window.addEventListener("utmify:pixel:error", handlePixelError);

    // Monitorar requisições de rede relacionadas ao Utmify
    const originalFetch = window.fetch;
    let fetchCount = 0;
    window.fetch = function (...args) {
      const url = args[0];
      if (typeof url === "string" && url.includes("utmify")) {
        fetchCount++;
        console.log(`[Utmify Monitor] Requisição #${fetchCount} detectada:`, url);
      }
      return originalFetch.apply(this, args);
    };

    return () => {
      clearInterval(interval);
      window.removeEventListener("utmify:pixel:loaded", handlePixelLoaded);
      window.removeEventListener("utmify:pixel:error", handlePixelError);
      window.fetch = originalFetch;
    };
  }, [isDev]);

  if (!isDev || !status) return null;
  return null;
}
