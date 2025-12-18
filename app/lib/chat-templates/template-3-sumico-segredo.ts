import type { ChatTemplate } from "./types";

/**
 * Template 3: Sumiço e segredo
 * Cenário de desconfiança sobre sumiço e segredos
 */
export const template3SumicoSegredo: ChatTemplate = {
  previous: [
    { type: "me", text: "cheguei em casa agora", blurred: true },
    { type: "other", text: "demorou hein…", blurred: true },
    { type: "me", text: "nem foi tudo isso", blurred: true },
    { type: "other", text: "pra quem sumiu o dia todo foi sim", blurred: true },
    { type: "other", text: "voice", duration: "0:19", blurred: true },
  ],
  main: [
    { type: "other", text: "se eu perguntar com quem você tava, você responde?" },
    { type: "me", text: "depende se você vai ficar com ciúmes ou não 😏" },
    { type: "other", text: "então já sei que não vou gostar da resposta" },
    { type: "me", text: "calma… não foi nada demais" },
    { type: "other", text: "engraçado, sempre é 'nada demais'" },
    { type: "me", text: "voice", duration: "0:54" },
    { type: "other", text: "voice", duration: "0:47" },
    { type: "other", text: "só me promete uma coisa: não mente pra mim." },
    { type: "me", text: "então não pergunta tudo 👀" },
  ],
};



