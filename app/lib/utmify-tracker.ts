/**
 * Sistema de tracking e monitoramento do pixel Utmify
 * Fornece funções para verificar se o pixel está funcionando e enviar eventos customizados
 */

const PIXEL_ID = "694062ecad5cf41795f0425c";
const IS_DEV = process.env.NODE_ENV === "development";

/**
 * Verifica se o pixel Utmify está carregado e funcionando
 */
export function isUtmifyPixelLoaded(): boolean {
  if (typeof window === "undefined") return false;

  const scriptExists = document.querySelector(
    'script[src*="cdn.utmify.com.br/scripts/pixel/pixel.js"]'
  );
  const pixelIdExists = (window as any).pixelId === PIXEL_ID;
  const utmifyExists = typeof (window as any).utmify !== "undefined";

  return Boolean(scriptExists && pixelIdExists && utmifyExists);
}

/**
 * Aguarda o pixel Utmify carregar (com timeout)
 */
export function waitForUtmifyPixel(timeout = 10000): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (isUtmifyPixelLoaded()) {
      resolve(true);
      return;
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (isUtmifyPixelLoaded()) {
        clearInterval(checkInterval);
        resolve(true);
        return;
      }

      if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        if (IS_DEV) {
          console.warn("[Utmify] Pixel não carregou dentro do timeout", timeout);
        }
        resolve(false);
      }
    }, 100);
  });
}

/**
 * Envia um evento customizado para o Utmify
 * O Utmify automaticamente captura eventos padrão, mas podemos enviar eventos customizados
 */
export async function trackEvent(
  eventName: string,
  eventData?: Record<string, unknown>
): Promise<void> {
  if (typeof window === "undefined") return;

  const event = {
    eventName,
    eventData,
    timestamp: Date.now(),
  };

  if (IS_DEV) {
    console.log("[Utmify Tracker] Evento:", event);
  }

  // Aguardar pixel carregar
  const pixelLoaded = await waitForUtmifyPixel(5000);

  if (!pixelLoaded) {
    if (IS_DEV) {
      console.warn("[Utmify Tracker] Pixel não está carregado, evento não será enviado:", eventName);
    }
    // Mesmo sem pixel, podemos armazenar eventos para envio posterior
    storeEventForRetry(event);
    return;
  }

  try {
    // O Utmify geralmente captura eventos automaticamente via pixel
    // Mas podemos usar a API se disponível
    const utmify = (window as any).utmify;
    if (utmify && typeof utmify.track === "function") {
      utmify.track(eventName, eventData);
      if (IS_DEV) {
        console.log("[Utmify Tracker] Evento enviado via API:", eventName);
      }
      return;
    }

    // Fallback: disparar evento customizado que o pixel pode capturar
    window.dispatchEvent(
      new CustomEvent("utmify:track", {
        detail: { eventName, eventData },
      })
    );

    if (IS_DEV) {
      console.log("[Utmify Tracker] Evento disparado via CustomEvent:", eventName);
    }
  } catch (error) {
    if (IS_DEV) {
      console.error("[Utmify Tracker] Erro ao enviar evento:", error);
    }
    storeEventForRetry(event);
  }
}

/**
 * Armazena eventos para retry posterior
 */
function storeEventForRetry(event: { eventName: string; eventData?: Record<string, unknown>; timestamp: number }): void {
  if (typeof window === "undefined") return;
  
  try {
    const stored = localStorage.getItem("utmify_pending_events");
    const events = stored ? JSON.parse(stored) : [];
    events.push(event);
    // Manter apenas os últimos 50 eventos
    const recentEvents = events.slice(-50);
    localStorage.setItem("utmify_pending_events", JSON.stringify(recentEvents));
  } catch (error) {
    if (IS_DEV) {
      console.error("[Utmify Tracker] Erro ao armazenar evento:", error);
    }
  }
}

/**
 * Tenta reenviar eventos pendentes
 */
export async function retryPendingEvents(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem("utmify_pending_events");
    if (!stored) return;

    const events = JSON.parse(stored);
    if (!Array.isArray(events) || events.length === 0) return;

    const pixelLoaded = await waitForUtmifyPixel(3000);
    if (!pixelLoaded) return;

    for (const event of events) {
      await trackEvent(event.eventName, event.eventData);
    }

    // Limpar eventos após envio bem-sucedido
    localStorage.removeItem("utmify_pending_events");
    if (IS_DEV) {
      console.log("[Utmify Tracker] Eventos pendentes reenviados:", events.length);
    }
  } catch (error) {
    if (IS_DEV) {
      console.error("[Utmify Tracker] Erro ao reenviar eventos:", error);
    }
  }
}

/**
 * Track de page view
 */
export function trackPageView(path: string, additionalData?: Record<string, unknown>): void {
  trackEvent("page_view", {
    path,
    url: typeof window !== "undefined" ? window.location.href : path,
    ...additionalData,
  });
}

/**
 * Track de conversão/lead
 */
export function trackConversion(
  conversionType: string,
  value?: number,
  additionalData?: Record<string, unknown>
): void {
  trackEvent("conversion", {
    conversion_type: conversionType,
    value,
    ...additionalData,
  });
}

/**
 * Track de interação do usuário
 */
export function trackInteraction(
  interactionType: string,
  element?: string,
  additionalData?: Record<string, unknown>
): void {
  trackEvent("interaction", {
    interaction_type: interactionType,
    element,
    ...additionalData,
  });
}

/**
 * Monitora o status do pixel e retorna informações de diagnóstico
 */
export function getPixelStatus(): {
  loaded: boolean;
  scriptExists: boolean;
  pixelIdCorrect: boolean;
  utmifyApiAvailable: boolean;
  timestamp: number;
} {
  if (typeof window === "undefined") {
    return {
      loaded: false,
      scriptExists: false,
      pixelIdCorrect: false,
      utmifyApiAvailable: false,
      timestamp: Date.now(),
    };
  }

  const scriptExists = Boolean(
    document.querySelector('script[src*="cdn.utmify.com.br/scripts/pixel/pixel.js"]')
  );
  const pixelIdCorrect = (window as any).pixelId === PIXEL_ID;
  const utmifyApiAvailable = typeof (window as any).utmify !== "undefined";
  const loaded = scriptExists && pixelIdCorrect && utmifyApiAvailable;

  return {
    loaded,
    scriptExists,
    pixelIdCorrect,
    utmifyApiAvailable,
    timestamp: Date.now(),
  };
}
