"use client";

import { useEffect } from "react";

const IS_DEV = process.env.NODE_ENV === "development";

/**
 * Componente que insere o script de UTMs do Utmify diretamente no head
 * Segue exatamente o formato fornecido pelo Utmify
 */
export function UtmifyUtmsScript() {
  useEffect(() => {
    // Verificar se já está no cliente
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    // Verificar se o script já foi adicionado
    const existingScript = document.querySelector(
      'script[src="https://cdn.utmify.com.br/scripts/utms/latest.js"]'
    );
    if (existingScript) {
      if (IS_DEV) {
        console.log("[Utmify UTMs] Script já existe");
      }
      return;
    }

    // Criar e adicionar o script exatamente como fornecido pelo Utmify
    const script = document.createElement("script");
    script.src = "https://cdn.utmify.com.br/scripts/utms/latest.js";
    script.setAttribute("data-utmify-prevent-xcod-sck", "");
    script.setAttribute("data-utmify-prevent-subids", "");
    script.async = true;
    script.defer = true;

    // Callbacks para monitoramento
    script.onload = () => {
      if (IS_DEV) {
        console.log("[Utmify UTMs] Script carregado com sucesso");
      }
    };

    script.onerror = () => {
      if (IS_DEV) {
        console.error("[Utmify UTMs] Erro ao carregar script");
      }
    };

    // Inserir no head (escopo da estrutura HTML)
    document.head.appendChild(script);

    if (IS_DEV) {
      console.log("[Utmify UTMs] Script adicionado ao head");
    }
  }, []);

  return null;
}
