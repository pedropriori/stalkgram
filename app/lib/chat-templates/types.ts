export interface ChatMessage {
  type: "other" | "me";
  text: string;
  blurred?: boolean;
  duration?: string;
  /**
   * Texto completo da mensagem (incluindo parte borrada)
   * Se fornecido, o campo `text` será exibido normalmente e o restante será borrado
   */
  fullText?: string;
  /**
   * Partes específicas do texto que devem ser borradas
   * Array de objetos com start e end (índices) ou palavras a serem borradas
   * Se fornecido, será usado em vez de fullText para blur parcial mais preciso
   */
  blurredParts?: Array<{ start: number; end: number }>;
  /**
   * Indica se a mensagem é uma localização
   * Quando true, o componente InstagramLocation será renderizado
   */
  isLocation?: boolean;
  /**
   * Indica se a mensagem é um conteúdo restrito (imagem)
   * Quando true, o componente RestrictedContent será renderizado
   */
  isRestrictedContent?: boolean;
  /**
   * Indica se a mensagem é uma mídia (foto ou vídeo)
   * Quando "photo" ou "video", o componente MediaMessage será renderizado
   */
  mediaType?: "photo" | "video";
}

export interface ChatTemplate {
  previous: ChatMessage[];
  main: ChatMessage[];
}

