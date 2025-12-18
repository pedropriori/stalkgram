import type { ChatTemplate } from "./types";

/**
 * Template 2: Curtidas e stories
 * Cenário de ciúme relacionado a curtidas e stories marcados
 */
export const template2CurtidasStories: ChatTemplate = {
  previous: [
    { type: "other", text: "você curtiu tudo denovo…", blurred: true },
    { type: "me", text: "é só amizade, relaxa", blurred: true },
    { type: "other", text: "engraçado, comigo você não reage assim", blurred: true },
    { type: "me", text: "para, você sabe que é diferente", blurred: true },
    { type: "other", text: "diferente como? 🤔", blurred: true },
    { type: "me", text: "voice", duration: "0:41", blurred: true },
  ],
  main: [
    { type: "other", text: "não achei graça daquele story de ontem…" },
    { type: "me", text: "qual deles? 😅" },
    { type: "other", text: "o que você marcou 'melhor companhia'…" },
    { type: "me", text: "exagera não, foi zoeira" },
    { type: "other", text: "zoeira pra quem lê… pra mim não foi" },
    { type: "other", text: "voice", duration: "0:32" },
    { type: "me", text: "voice", duration: "1:03" },
    { type: "other", text: "tá… então prova que é só zoeira." },
    { type: "me", text: "cuidado com o que você pede 👀" },
  ],
};



