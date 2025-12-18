import type { ChatTemplate } from "./types";

/**
 * Template 1: Conversa com mensagens parcialmente borradas
 * Cenário de discussão com partes do texto ocultas por blur
 */
export const template1ViuOntem: ChatTemplate = {
  previous: [],
  main: [
    { type: "other", text: "você já chegou?" },
    {
      type: "me",
      text: "Não... ainda estou com",
      fullText: "Não... ainda estou com ela aqui",
      blurred: true
    },
    {
      type: "other",
      text: "Denovo? Você disse que",
      fullText: "Denovo? Você disse que não ia ver ela de novo 😡",
      blurred: true
    },
    {
      type: "me",
      text: "desculpa, eu sei que to vacilando mas prometo que vou parar de ver ela ❤️",
      blurred: true
    },
    {
      type: "other",
      text: "Não acredito!!! Você sempre faz isso quando está com",
      fullText: "Não acredito!!! Você sempre faz isso quando está com ela",
      blurred: true
    },
    { type: "other", text: "voice", duration: "0:32" },
    { type: "me", text: "voice", duration: "1:47" },
    {
      type: "other",
      text: "Não quero mais saber, vou",
      fullText: "Não quero mais saber, vou embora",
      blurred: true
    },
    {
      type: "me",
      text: "Vamos conversar pessoalmente na",
      fullText: "Vamos conversar pessoalmente na sua casa e vamos resolver",
      blurred: true
    },
  ],
};



