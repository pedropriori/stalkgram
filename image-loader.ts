/**
 * Custom image loader para Next.js
 * Para imagens do Instagram, usa proxy images.weserv.nl para evitar timeout
 * Para outras imagens, retorna URL direta (Next.js não otimiza quando usa custom loader)
 */
export default function customImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  // Se for uma imagem do Instagram, usar proxy images.weserv.nl
  // Isso evita o timeout de 7 segundos do Next.js Image Optimization
  // e o proxy tem melhor confiabilidade e timeout maior
  if (src.includes("cdninstagram.com") || src.includes("fbcdn.net")) {
    const encodedUrl = encodeURIComponent(src);
    // Usar proxy com parâmetros de otimização
    return `https://images.weserv.nl/?url=${encodedUrl}&w=${width}&q=${quality || 75}&output=webp`;
  }

  // Para imagens locais ou data URLs, retornar como está
  if (src.startsWith("/") || src.startsWith("data:")) {
    return src;
  }

  // Para outras URLs remotas, retornar direto (sem otimização do Next.js quando usa custom loader)
  return src;
}


