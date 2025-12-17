import type { ChatTemplate } from "./types";

/**
 * Template 5: Conversa revelando conteúdo reservado
 * Inclui anexos de foto/vídeo e conteúdo restrito enviado pelo usuário
 */
export const template5Revelacao: ChatTemplate = {
  previous: [],
  main: [
    { type: "other", text: "preciso falar contigo parada séria" },
    {
      type: "me",
      text: "desculpa a demora estava",
      fullText: "desculpa a demora estava com minha namorada",
      blurred: true,
      blurredParts: [
        { start: 26, end: 44 }, // "com minha namorada"
      ],
    },
    {
      type: "other",
      text: "vai tá livre",
      fullText: "vai tá livre quarta-feira da semana que vem?",
      blurred: true,
      blurredParts: [
        { start: 11, end: 24 }, // "quarta-feira"
      ],
    },
    { type: "other", text: "de noitee no caso" },
    { type: "me", text: "acho que sim, mas te aviso" },
    { type: "me", text: "pq?" },
    { type: "other", text: "olha" },
    { type: "other", text: "", mediaType: "photo" },
    { type: "other", text: "", mediaType: "video" },
    {
      type: "me",
      text: "mensagem restrita",
      blurred: true,
    },
    {
      type: "me",
      text: "",
      isRestrictedContent: true,
    },
  ],
};
