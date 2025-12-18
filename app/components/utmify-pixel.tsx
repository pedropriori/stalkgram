"use client";

import { useEffect } from "react";

const PIXEL_ID = "694062ecad5cf41795f0425c";
const IS_DEV = process.env.NODE_ENV === "development";

export function UtmifyPixel() {
  useEffect(() => {
    // Verificar se já está no cliente
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    // Adicionar error handler global para suprimir erros do ipify IPv6
    const originalError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      // Ignorar erros relacionados ao api6.ipify.org (IPv6 não disponível)
      if (
        typeof message === "string" &&
        (message.includes("api6.ipify.org") ||
          message.includes("ERR_NAME_NOT_RESOLVED") ||
          message.includes("Failed to fetch"))
      ) {
        return true; // Suprimir o erro
      }
      // Para outros erros, usar o handler original se existir
      if (originalError) {
        return originalError(message, source, lineno, colno, error);
      }
      return false;
    };

    // Adicionar unhandledrejection handler para promises rejeitadas
    const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (
        reason &&
        typeof reason === "object" &&
        "message" in reason &&
        typeof reason.message === "string" &&
        (reason.message.includes("api6.ipify.org") ||
          reason.message.includes("ERR_NAME_NOT_RESOLVED") ||
          reason.message.includes("Failed to fetch"))
      ) {
        event.preventDefault(); // Suprimir o erro
      }
    };
    window.addEventListener("unhandledrejection", unhandledRejectionHandler);

    // Verificar se o script já foi adicionado
    const existingScript = document.querySelector(
      'script[src="https://cdn.utmify.com.br/scripts/pixel/pixel.js"]'
    );
    if (existingScript) {
      if (IS_DEV) {
        console.log("[Utmify Pixel] Script já existe");
      }
      return () => {
        window.removeEventListener("unhandledrejection", unhandledRejectionHandler);
        window.onerror = originalError;
      };
    }

    // Seguir exatamente o formato fornecido pelo Utmify
    // window.pixelId = "694062ecad5cf41795f0425c";
    (window as any).pixelId = PIXEL_ID;

    // var a = document.createElement("script");
    const a = document.createElement("script");
    // a.setAttribute("async", "");
    a.setAttribute("async", "");
    // a.setAttribute("defer", "");
    a.setAttribute("defer", "");
    // a.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel.js");
    a.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel.js");
    // document.head.appendChild(a);

    // Callbacks para monitoramento (adicionados após seguir o formato exato)
    a.onload = () => {
      if (IS_DEV) {
        console.log("[Utmify Pixel] Script carregado com sucesso");
      }
      // Disparar evento quando pixel estiver pronto
      window.dispatchEvent(new CustomEvent("utmify:pixel:loaded"));
    };

    a.onerror = () => {
      if (IS_DEV) {
        console.error("[Utmify Pixel] Erro ao carregar script");
      }
      window.dispatchEvent(new CustomEvent("utmify:pixel:error"));
    };

    document.head.appendChild(a);

    if (IS_DEV) {
      console.log("[Utmify Pixel] Script adicionado ao head");
    }

    // Cleanup
    return () => {
      window.removeEventListener("unhandledrejection", unhandledRejectionHandler);
      window.onerror = originalError;
    };
  }, []);

  return null;
}



