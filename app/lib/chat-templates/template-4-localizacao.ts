import type { ChatTemplate } from "./types";

/**
 * Template 4: Conversa com localização compartilhada
 * Cenário de conversa sobre encontro com compartilhamento de localização
 */
export const template4Localizacao: ChatTemplate = {
  previous: [],
  main: [
    { type: "me", text: "eii, tá aí?" },
    {
      type: "me",
      text: "na",
      fullText: "na terça-feira dessa semana consigo ir ai viu 👀",
      blurred: true,
      blurredParts: [
        { start: 3, end: 14 }, // "terça-feira"
        { start: 36, end: 48 }, // "ir ai viu 👀"
      ],
    },
    {
      type: "other",
      text: "uai mas e",
      fullText: "uai mas e sua mulhers não vai tá com vc não?",
      blurred: true,
      blurredParts: [
        { start: 10, end: 21 }, // "sua mulhers"
      ],
    },
    {
      type: "me",
      text: "não kkk",
      fullText: "não kkk vou falar que vou ir pra tal lugar",
      blurred: true,
    },
    {
      type: "other",
      text: "ai ai kkkkkk",
      fullText: "ai ai kkkkkk vc em, vamos então",
      blurred: true,
    },
    { type: "other", text: "vou te mandar a localização" },
    {
      type: "other",
      text: "",
      isLocation: true,
    },
    { type: "other", text: "Em {{city}} viu" },
    {
      type: "me",
      text: "beleza kk",
      blurred: true,
    },
  ],
};

