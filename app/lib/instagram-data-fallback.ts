import { cookies } from "next/headers";
import { getInstagramData } from "@/app/lib/instagram-data";
import { readGenderForUsername } from "@/app/lib/gender";
import { buildMockInstagramData } from "@/app/lib/mock-instagram";
import type { InstagramScrapeResult } from "@/app/api/instagram/instagram-scraper";

export interface InstagramDataResult {
  data: InstagramScrapeResult;
  usedMock: boolean;
}

/**
 * Obtém dados do Instagram com fallback para mock quando necessário.
 * 
 * Lógica de fallback:
 * 1. Se a API falhar completamente → retorna mock completo (perfil + followings)
 * 2. Se a API retornar sucesso mas:
 *    - Perfil for privado OU
 *    - followingSample estiver vazio
 *    → mantém perfil real, substitui followings por mock
 * 3. Caso contrário → retorna dados reais
 * 
 * @param username - Username do perfil (sem @)
 * @returns Dados do Instagram (reais ou mock) e flag indicando se usou mock
 */
export async function getInstagramDataOrMock(
  username: string,
): Promise<InstagramDataResult> {
  const cleanUsername = username.replace("@", "").trim().toLowerCase();
  
  // Tentar obter gênero do cookie
  const cookieStore = await cookies();
  const targetGender = readGenderForUsername(cookieStore, cleanUsername) || "masculino"; // Default masculino
  
  try {
    // Tentar buscar dados reais da API
    const realData = await getInstagramData(cleanUsername);
    
    // Verificar se precisa usar mock para followings
    const needsMockFollowings = realData.profile.isPrivate || realData.followingSample.length === 0;
    
    if (needsMockFollowings) {
      // Gerar mock apenas para followings, mantendo perfil real
      const mockData = buildMockInstagramData(cleanUsername, targetGender);
      
      return {
        data: {
          ...realData,
          followingSample: mockData.followingSample,
        },
        usedMock: true,
      };
    }
    
    // Dados reais completos
    return {
      data: realData,
      usedMock: false,
    };
  } catch (error) {
    // API falhou completamente → usar mock completo
    const mockData = buildMockInstagramData(cleanUsername, targetGender);
    
    return {
      data: mockData,
      usedMock: true,
    };
  }
}



