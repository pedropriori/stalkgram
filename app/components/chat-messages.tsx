'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from "next/image";
import AccessPopup from './access-popup';
import InstagramTimestamp from './instagram-timestamp';
import InstagramLocation from './instagram-location';
import RestrictedContent from './restricted-content';
import MediaMessage from './media-message';

interface ChatMessage {
  type: 'other' | 'me';
  text: string;
  blurred?: boolean;
  duration?: string;
  fullText?: string;
  blurredParts?: Array<{ start: number; end: number }>;
  isLocation?: boolean;
  isRestrictedContent?: boolean;
  mediaType?: 'photo' | 'video';
}

/**
 * Renderiza texto com blur em partes específicas
 */
function renderTextWithBlurParts(
  fullText: string,
  blurredParts: Array<{ start: number; end: number }>
): React.ReactElement[] {
  // Ordenar partes borradas por posição
  const sortedParts = [...blurredParts].sort((a, b) => a.start - b.start);

  const elements: React.ReactElement[] = [];
  let lastIndex = 0;

  sortedParts.forEach((part, index) => {
    // Adicionar texto visível antes do blur
    if (part.start > lastIndex) {
      elements.push(
        <span key={`visible-${index}`}>
          {fullText.substring(lastIndex, part.start)}
        </span>
      );
    }

    // Adicionar texto borrado
    elements.push(
      <span key={`blurred-${index}`} className="blur-[4px] select-none inline">
        {fullText.substring(part.start, part.end)}
      </span>
    );

    lastIndex = part.end;
  });

  // Adicionar texto visível após o último blur
  if (lastIndex < fullText.length) {
    elements.push(
      <span key="visible-end">
        {fullText.substring(lastIndex)}
      </span>
    );
  }

  return elements;
}

interface ChatMessagesProps {
  previousMessages: ChatMessage[];
  chatMessages: ChatMessage[];
  username?: string;
  otherUserProfilePicUrl?: string;
  otherUserUsername?: string;
}

export default function ChatMessages({
  previousMessages,
  chatMessages,
  username,
  otherUserProfilePicUrl,
  otherUserUsername,
}: ChatMessagesProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [hasScrolledToTop, setHasScrolledToTop] = useState(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Scroll para o final (mostrar mensagens principais primeiro)
    const scrollToBottom = () => {
      container.scrollTop = container.scrollHeight;
    };

    // Aguardar renderização completa antes de fazer scroll
    setTimeout(scrollToBottom, 100);
    setTimeout(scrollToBottom, 300);

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      // Calcular a posição onde começam as mensagens principais (sem blur)
      // As mensagens anteriores têm blur, então se scrollar muito para cima, mostrar popup
      const threshold = 200; // Distância do topo em pixels

      if (scrollTop < threshold && !hasScrolledToTop) {
        setHasScrolledToTop(true);
        setShowPopup(true);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [hasScrolledToTop]);

  const handleBlurredClick = () => {
    setShowPopup(true);
  };

  const renderMessage = (msg: ChatMessage, index: number, isPrevious: boolean = false) => {
    const isBlurred = msg.blurred || isPrevious;
    const hasBlurredParts = msg.blurredParts && msg.blurredParts.length > 0 && msg.fullText;
    const hasPartialBlur = !hasBlurredParts && msg.fullText && msg.fullText.length > msg.text.length && isBlurred;
    const hasFullBlur = isBlurred && !hasBlurredParts && !hasPartialBlur;
    const clickHandler = (isBlurred || hasBlurredParts) ? handleBlurredClick : undefined;
    // Mensagens de áudio e localização sempre mostram popup ao clicar
    const voiceClickHandler = msg.text === 'voice' ? handleBlurredClick : clickHandler;
    const locationClickHandler = msg.isLocation ? handleBlurredClick : clickHandler;

    if (msg.type === 'other') {
      // Para mensagens principais, contar quantas mensagens "other" vieram antes desta
      const otherMessagesBeforeThis = isPrevious
        ? 0
        : chatMessages.slice(0, index).filter(m => m.type === 'other').length;

      // Aplicar blur nas primeiras 5 fotos de perfil das mensagens principais (não anteriores)
      // E também aplicar blur em todas as fotos das mensagens anteriores
      // Mensagens de mídia sempre têm blur na foto de perfil
      const shouldBlurProfilePic = isPrevious || (!isPrevious && otherMessagesBeforeThis < 5) || !!msg.mediaType;

      return (
        <div key={`other-${index}`} className="flex items-end gap-2">
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center shrink-0 overflow-hidden">
            {otherUserProfilePicUrl ? (
              shouldBlurProfilePic ? (
                <div className="h-full w-full rounded-full overflow-hidden blur-xs">
                  <Image
                    src={otherUserProfilePicUrl}
                    alt={otherUserUsername ?? "Foto de perfil"}
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <Image
                  src={otherUserProfilePicUrl}
                  alt={otherUserUsername ?? "Foto de perfil"}
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              )
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>
          {msg.isLocation ? (
            <div onClick={locationClickHandler}>
              <InstagramLocation
                profilePicUrl={otherUserProfilePicUrl || ''}
                username={otherUserUsername || ''}
                onClick={locationClickHandler}
              />
            </div>
          ) : msg.mediaType ? (
            <div onClick={clickHandler}>
              <MediaMessage
                type={msg.mediaType}
                onClick={clickHandler}
              />
            </div>
          ) : msg.text === 'voice' ? (
            <button
              className="text-left max-w-xs lg:max-w-md cursor-pointer focus:outline-none"
              onClick={voiceClickHandler}
            >
              <div className="px-3 py-2 rounded-2xl bg-gray-800 text-white">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 py-1 px-2 rounded-2xl">
                    <div className="focus:outline-none">
                      <svg
                        width="auto"
                        height="40"
                        viewBox="0 0 381 79"
                        fill="none"
                        className="h-10"
                      >
                        <path
                          d="M24.3758 37.8167C25.6026 38.6037 25.6026 40.3965 24.3758 41.1835L3.0799 54.8448C1.74878 55.6987 -6.91281e-08 54.7429 0 53.1614L1.19431e-06 25.8387C1.26344e-06 24.2573 1.74878 23.3014 3.0799 24.1553L24.3758 37.8167Z"
                          fill="#5653FC"
                        />
                        <rect x="44.7969" y="34.5" width="6" height="10" rx="3" fill="white" />
                        <rect x="55.7969" y="34.5" width="6" height="10" rx="3" fill="white" />
                        <circle cx="69.7969" cy="39.5" r="3" fill="white" />
                        <rect x="77.7969" y="22" width="6" height="35" rx="3" fill="white" />
                        <rect x="88.7969" y="4.5" width="6" height="70" rx="3" fill="white" />
                        <rect x="99.7969" y="4.5" width="6" height="70" rx="3" fill="white" />
                        <rect x="110.797" y="7" width="6" height="65" rx="3" fill="white" />
                        <rect x="121.797" y="9.5" width="6" height="60" rx="3" fill="white" />
                        <rect x="132.797" y="8" width="6" height="63" rx="3" fill="white" />
                        <rect x="143.797" y="2" width="6" height="75" rx="3" fill="white" />
                        <rect x="154.797" y="8" width="6" height="63" rx="3" fill="white" />
                        <rect x="165.797" width="6" height="79" rx="3" fill="white" />
                        <rect x="176.797" y="4" width="6" height="71" rx="3" fill="white" />
                        <rect x="187.797" y="4" width="6" height="71" rx="3" fill="white" />
                        <rect x="198.797" y="4" width="6" height="71" rx="3" fill="white" />
                        <rect x="209.797" y="4" width="6" height="71" rx="3" fill="white" />
                        <rect x="220.797" y="9" width="6" height="61" rx="3" fill="white" />
                        <rect x="231.797" y="11" width="6" height="57" rx="3" fill="white" />
                        <rect x="242.797" y="8" width="6" height="63" rx="3" fill="white" />
                        <rect x="253.797" y="8" width="6" height="63" rx="3" fill="white" />
                        <rect x="264.797" y="2" width="6" height="75" rx="3" fill="white" />
                        <rect x="275.797" y="5" width="6" height="69" rx="3" fill="white" />
                        <rect x="286.797" y="2" width="6" height="75" rx="3" fill="white" />
                        <rect x="297.797" width="6" height="79" rx="3" fill="white" />
                        <rect x="308.797" y="2" width="6" height="75" rx="3" fill="white" />
                        <rect x="319.797" y="5" width="6" height="69" rx="3" fill="white" />
                        <rect x="330.797" y="5" width="6" height="69" rx="3" fill="white" />
                        <rect x="341.797" y="2" width="6" height="75" rx="3" fill="white" />
                        <rect x="352.797" y="5" width="6" height="69" rx="3" fill="white" />
                        <rect x="363.797" y="4" width="6" height="71" rx="3" fill="white" />
                        <rect x="374.797" y="9" width="6" height="61" rx="3" fill="white" />
                      </svg>
                    </div>
                    <span className="text-xs ml-2 text-gray-600">{msg.duration}</span>
                  </div>
                  <div className="px-1">
                    <span className="text-xs text-gray-500">Ver transcrição</span>
                  </div>
                </div>
              </div>
            </button>
          ) : (
            <div
              className={`bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[75%] ${hasFullBlur ? 'blur-[4px] select-none cursor-pointer' : ''} ${(hasPartialBlur || hasBlurredParts) ? 'cursor-pointer' : ''}`}
              onClick={clickHandler}
            >
              {hasBlurredParts ? (
                <p className="text-sm text-white leading-relaxed">
                  {renderTextWithBlurParts(msg.fullText!, msg.blurredParts!)}
                </p>
              ) : hasPartialBlur ? (
                <p className="text-sm text-white leading-relaxed">
                  <span>{msg.text}</span>
                  <span className="blur-[4px] select-none inline">{msg.fullText?.slice(msg.text.length)}</span>
                </p>
              ) : (
                <p className="text-sm text-white leading-relaxed">{msg.text}</p>
              )}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div key={`me-${index}`} className="flex justify-end">
          {msg.isRestrictedContent ? (
            <RestrictedContent onClick={handleBlurredClick} />
          ) : msg.text === 'voice' ? (
            <button
              className="text-left max-w-xs lg:max-w-md cursor-pointer focus:outline-none"
              onClick={voiceClickHandler}
            >
              <div
                className="px-3 py-2 rounded-2xl bg-transparent text-white"
                style={{
                  background: 'linear-gradient(135deg, rgb(114, 33, 255) 0%, rgb(136, 19, 232) 100%)',
                }}
              >
                <div className="space-y-2">
                  <div
                    className="flex items-center space-x-2 py-1 px-2 rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgb(114, 33, 255) 0%, rgb(136, 19, 232) 100%)',
                    }}
                  >
                    <div className="focus:outline-none">
                      <svg
                        width="auto"
                        height="40"
                        viewBox="0 0 382 79"
                        fill="none"
                        className="h-10"
                      >
                        <path
                          d="M24.3758 37.8167C25.6026 38.6037 25.6026 40.3965 24.3758 41.1835L3.0799 54.8448C1.74878 55.6987 -6.91281e-08 54.7429 0 53.1614L1.19431e-06 25.8387C1.26344e-06 24.2573 1.74878 23.3014 3.0799 24.1553L24.3758 37.8167Z"
                          fill="white"
                        />
                        <rect x="45.2969" width="6" height="79" rx="3" fill="white" />
                        <rect x="56.2969" y="2" width="6" height="75" rx="3" fill="white" />
                        <rect x="67.2969" y="4" width="6" height="71" rx="3" fill="white" />
                        <rect x="78.2969" y="4" width="6" height="71" rx="3" fill="white" />
                        <rect x="89.2969" y="8" width="6" height="63" rx="3" fill="white" />
                        <rect x="100.297" y="2" width="6" height="75" rx="3" fill="white" />
                        <rect x="111.297" y="8" width="6" height="63" rx="3" fill="white" />
                        <rect x="122.297" y="11" width="6" height="57" rx="3" fill="white" />
                        <rect x="133.297" y="11" width="6" height="57" rx="3" fill="white" />
                        <rect x="144.297" y="14" width="6" height="51" rx="3" fill="white" />
                        <rect x="155.297" y="14" width="6" height="51" rx="3" fill="white" />
                        <rect x="166.297" y="11" width="6" height="57" rx="3" fill="white" />
                        <rect x="177.297" y="19" width="6" height="41" rx="3" fill="white" />
                        <rect x="188.297" y="16" width="6" height="47" rx="3" fill="white" />
                        <rect x="199.297" y="19" width="6" height="41" rx="3" fill="white" />
                        <rect x="210.297" y="14" width="6" height="51" rx="3" fill="white" />
                        <rect x="221.297" y="11" width="6" height="57" rx="3" fill="white" />
                        <rect x="232.297" y="5" width="6" height="69" rx="3" fill="white" />
                        <rect x="243.297" y="2" width="6" height="75" rx="3" fill="white" />
                        <rect x="254.297" width="6" height="79" rx="3" fill="white" />
                        <rect x="265.297" y="11" width="6" height="57" rx="3" fill="white" />
                        <rect x="276.297" y="14" width="6" height="51" rx="3" fill="white" />
                        <rect x="287.297" y="9" width="6" height="61" rx="3" fill="white" />
                        <rect x="298.297" y="7" width="6" height="65" rx="3" fill="white" />
                        <rect x="309.297" y="5" width="6" height="69" rx="3" fill="white" />
                        <rect x="320.297" y="4" width="6" height="71" rx="3" fill="white" />
                        <rect x="331.297" y="9" width="6" height="61" rx="3" fill="white" />
                        <rect x="342.297" y="14" width="6" height="51" rx="3" fill="white" />
                        <rect x="353.297" y="21" width="6" height="37" rx="3" fill="white" />
                        <rect x="364.297" y="28" width="6" height="23" rx="3" fill="white" />
                        <rect x="375.297" y="36.5" width="6" height="6" rx="3" fill="white" />
                      </svg>
                    </div>
                    <span className="text-xs ml-2 text-white">{msg.duration}</span>
                  </div>
                  <div className="px-1">
                    <span className="text-xs text-white">Ver transcrição</span>
                  </div>
                </div>
              </div>
            </button>
          ) : (
            <div
              className={`bg-purple-600 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[75%] ${hasFullBlur ? 'blur-[4px] select-none cursor-pointer' : ''} ${(hasPartialBlur || hasBlurredParts) ? 'cursor-pointer' : ''}`}
              onClick={clickHandler}
            >
              {hasBlurredParts ? (
                <p className="text-sm text-white leading-relaxed">
                  {renderTextWithBlurParts(msg.fullText!, msg.blurredParts!)}
                </p>
              ) : hasPartialBlur ? (
                <p className="text-sm text-white leading-relaxed">
                  <span>{msg.text}</span>
                  <span className="blur-[4px] select-none inline">{msg.fullText?.slice(msg.text.length)}</span>
                </p>
              ) : (
                <p className="text-sm text-white leading-relaxed">{msg.text}</p>
              )}
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <>
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 pb-20">
        <div className="pt-6 pb-4">
          <div className="space-y-4">
            {/* Mensagens anteriores (com blur) */}
            {previousMessages.map((msg, index) => renderMessage(msg, index, true))}

            {/* Timestamp centralizado na divisão entre mensagens com blur e sem blur */}
            <div className="flex justify-center items-center my-4">
              <InstagramTimestamp
                seed={username && otherUserUsername ? `${username}-${otherUserUsername}-chat-timestamp` : undefined}
              />
            </div>

            {/* Mensagens principais (sem blur) */}
            {chatMessages.map((msg, index) => renderMessage(msg, index, false))}
          </div>
        </div>
      </div>
      {showPopup && <AccessPopup username={username} onClose={() => setShowPopup(false)} />}
    </>
  );
}

