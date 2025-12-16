import { unstable_cache } from "next/cache";
import scrapeInstagram, { type InstagramScrapeResult } from "../api/instagram/instagram-scraper";

const DEFAULT_TTL_SECONDS = 300; // 5 minutos

function getProviderMode(): string {
  return (process.env.INSTAGRAM_PROVIDER || "auto").toLowerCase();
}

function getCacheTTL(): number {
  const ttlMs = parseInt(
    process.env.INSTAGRAM_CACHE_TTL_MS || String(DEFAULT_TTL_SECONDS * 1000),
    10,
  );
  return Math.floor(ttlMs / 1000); // Converter para segundos
}

/**
 * Obtém dados do Instagram com cache persistente usando Next.js unstable_cache.
 * O cache é compartilhado entre todas as páginas e rotas da API, reduzindo
 * chamadas desnecessárias aos provedores externos.
 *
 * O unstable_cache do Next.js gerencia automaticamente o cache baseado nas
 * chaves fornecidas, garantindo que múltiplas chamadas com o mesmo username
 * reutilizem os dados cacheados dentro do TTL configurado.
 *
 * @param username - Nome de usuário do Instagram (sem @)
 * @returns Dados do perfil e amostra de seguidos
 */
export async function getInstagramData(
  username: string,
): Promise<InstagramScrapeResult> {
  const cleanUsername = username.replace("@", "").trim().toLowerCase();
  if (!cleanUsername) {
    throw new Error("Username inválido.");
  }

  const providerMode = getProviderMode();
  const ttl = getCacheTTL();

  // Criar chave única que inclui o provider e username para garantir consistência
  // O unstable_cache usa essa chave para identificar entradas únicas no cache
  const cacheKeyParts = [`instagram`, providerMode, cleanUsername];

  // Usar unstable_cache para cache persistente compartilhado
  // A função interna captura cleanUsername via closure
  // O Next.js gerencia automaticamente o cache baseado nas chaves fornecidas
  const cachedScrape = unstable_cache(
    async () => {
      if (process.env.NODE_ENV === "development") {
        console.log(`[Cache MISS] Fetching Instagram data for: ${cleanUsername}`);
      }
      return scrapeInstagram(cleanUsername);
    },
    cacheKeyParts,
    {
      revalidate: ttl,
      tags: [`instagram:${providerMode}`, `instagram:${cleanUsername}`],
    },
  );

  if (process.env.NODE_ENV === "development") {
    console.log(
      `[Cache] Requesting Instagram data for: ${cleanUsername} (provider: ${providerMode}, TTL: ${ttl}s)`,
    );
  }

  return cachedScrape();
}

/**
 * Invalida o cache de um usuário específico.
 * Útil para forçar uma nova busca quando necessário.
 *
 * @param username - Nome de usuário do Instagram (sem @)
 */
export async function revalidateInstagramCache(
  username: string,
): Promise<void> {
  const { revalidateTag } = await import("next/cache");
  const cleanUsername = username.replace("@", "").trim().toLowerCase();
  const providerMode = getProviderMode();

  const tags = [`instagram:${providerMode}`, `instagram:${cleanUsername}`];

  // Next.js 16 requer o segundo parâmetro 'max' para stale-while-revalidate
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }

  if (process.env.NODE_ENV === "development") {
    console.log(
      `[Cache] Invalidated cache for: ${cleanUsername} (tags: ${tags.join(", ")})`,
    );
  }
}
