import type { ChatTemplate } from "./types";
import { template1ViuOntem } from "./template-1-viu-ontem";
import { template2CurtidasStories } from "./template-2-curtidas-stories";
import { template3SumicoSegredo } from "./template-3-sumico-segredo";
import { template4Localizacao } from "./template-4-localizacao";
import { template5Revelacao } from "./template-5-revelacao";

/**
 * Array com todos os templates de chat disponíveis
 */
export const chatTemplates: ChatTemplate[] = [
  template1ViuOntem,
  template2CurtidasStories,
  template3SumicoSegredo,
  template4Localizacao,
  template5Revelacao,
];

/**
 * Função para gerar um número determinístico baseado em uma string
 * Usado para selecionar um template de forma consistente baseado em um seed
 * Também pode ser usada para outras operações que requerem hash determinístico
 */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Seleciona um template de chat de forma determinística baseado em um seed
 * O mesmo seed sempre retornará o mesmo template
 * 
 * @param seed - String usada como base para seleção determinística do template
 * @returns Template de chat selecionado
 */
export function getDeterministicChatTemplate(seed: string): ChatTemplate {
  // Debug: Forçar template específico via variável de ambiente
  // Use FORCE_CHAT_TEMPLATE=0,1,2 no .env.local para testar templates específicos
  const forceTemplateIndex = process.env.FORCE_CHAT_TEMPLATE;
  if (forceTemplateIndex !== undefined) {
    const index = parseInt(forceTemplateIndex, 10);
    if (index >= 0 && index < chatTemplates.length) {
      return chatTemplates[index];
    }
  }

  const hash = hashString(seed);
  return chatTemplates[hash % chatTemplates.length];
}

