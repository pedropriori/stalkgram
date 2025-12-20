import type { InstagramScrapeResult } from "../instagram-scraper";

type ProviderMode = "auto" | "ofertapremium" | "hiker" | "legacy";

interface CacheEntry {
  data: InstagramScrapeResult;
  expiresAt: number;
}

interface InFlightRequest {
  promise: Promise<InstagramScrapeResult>;
  timestamp: number;
}

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutos

const cache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, InFlightRequest>();

const CLEANUP_INTERVAL_MS = 60 * 1000; // Limpar a cada 1 minuto

let cleanupInterval: NodeJS.Timeout | null = null;

function startCleanupInterval(): void {
  if (cleanupInterval) return;

  cleanupInterval = setInterval(() => {
    const now = Date.now();

    for (const [key, entry] of cache.entries()) {
      if (entry.expiresAt <= now) {
        cache.delete(key);
      }
    }

    for (const [key, request] of inFlightRequests.entries()) {
      if (now - request.timestamp > 30000) {
        inFlightRequests.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);
}

export function getCacheKey(username: string, providerMode: ProviderMode): string {
  return `instagram:${username}:${providerMode}`;
}

export function getCached(key: string): InstagramScrapeResult | null {
  const entry = cache.get(key);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

export function setCached(
  key: string,
  data: InstagramScrapeResult,
  ttlMs?: number,
): void {
  const ttl = ttlMs || parseInt(process.env.INSTAGRAM_CACHE_TTL_MS || String(DEFAULT_TTL_MS), 10);
  const expiresAt = Date.now() + ttl;

  cache.set(key, { data, expiresAt });
  startCleanupInterval();
}

export async function getOrCreateInFlight(
  key: string,
  factory: () => Promise<InstagramScrapeResult>,
): Promise<InstagramScrapeResult> {
  const existing = inFlightRequests.get(key);
  if (existing) {
    return existing.promise;
  }

  const promise = factory().finally(() => {
    inFlightRequests.delete(key);
  });

  inFlightRequests.set(key, {
    promise,
    timestamp: Date.now(),
  });

  return promise;
}

export function clearCache(): void {
  cache.clear();
  inFlightRequests.clear();
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

