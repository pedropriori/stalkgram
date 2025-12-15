'use client';

import { useRef, useEffect, useState } from 'react';
import AccessPopup from './access-popup';

interface ChatMessage {
  type: 'other' | 'me';
  text: string;
  blurred?: boolean;
  duration?: string;
}

interface ChatMessagesProps {
  previousMessages: ChatMessage[];
  chatMessages: ChatMessage[];
  username?: string;
}

export default function ChatMessages({ previousMessages, chatMessages, username }: ChatMessagesProps) {
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
    const clickHandler = isBlurred ? handleBlurredClick : undefined;
    // Mensagens de áudio sempre mostram popup ao clicar
    const voiceClickHandler = msg.text === 'voice' ? handleBlurredClick : clickHandler;

    if (msg.type === 'other') {
      return (
        <div key={`other-${index}`} className="flex items-end gap-2">
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
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
          </div>
          {msg.text === 'voice' ? (
            <div
              className={`bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[75%] cursor-pointer ${isBlurred ? 'blur-sm select-none' : ''}`}
              onClick={voiceClickHandler}
            >
              <div className="flex items-center gap-3">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <div className="flex-1 flex items-center gap-0.5">
                  <div className="h-1 w-0.5 bg-white rounded-full" />
                  <div className="h-2 w-0.5 bg-white rounded-full" />
                  <div className="h-3 w-0.5 bg-white rounded-full" />
                  <div className="h-4 w-0.5 bg-white rounded-full" />
                  <div className="h-3 w-0.5 bg-white rounded-full" />
                  <div className="h-2 w-0.5 bg-white rounded-full" />
                  <div className="h-1 w-0.5 bg-white rounded-full" />
                </div>
                <span className="text-xs text-white/80">{msg.duration}</span>
              </div>
              <p className="text-xs text-white/60 mt-2">Ver transcrição</p>
            </div>
          ) : (
            <div
              className={`bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[75%] ${isBlurred ? 'blur-sm select-none cursor-pointer' : ''}`}
              onClick={clickHandler}
            >
              <p className="text-sm text-white leading-relaxed">{msg.text}</p>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div key={`me-${index}`} className="flex justify-end">
          {msg.text === 'voice' ? (
            <div
              className={`bg-purple-600 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[75%] cursor-pointer ${isBlurred ? 'blur-sm select-none' : ''}`}
              onClick={voiceClickHandler}
            >
              <div className="flex items-center gap-3">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <div className="flex-1 flex items-center gap-0.5">
                  <div className="h-1 w-0.5 bg-white rounded-full" />
                  <div className="h-2 w-0.5 bg-white rounded-full" />
                  <div className="h-3 w-0.5 bg-white rounded-full" />
                  <div className="h-4 w-0.5 bg-white rounded-full" />
                  <div className="h-3 w-0.5 bg-white rounded-full" />
                  <div className="h-2 w-0.5 bg-white rounded-full" />
                  <div className="h-1 w-0.5 bg-white rounded-full" />
                </div>
                <span className="text-xs text-white/80">{msg.duration}</span>
              </div>
              <p className="text-xs text-white/60 mt-2">Ver transcrição</p>
            </div>
          ) : (
            <div
              className={`bg-purple-600 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[75%] ${isBlurred ? 'blur-sm select-none cursor-pointer' : ''}`}
              onClick={clickHandler}
            >
              <p className="text-sm text-white leading-relaxed">{msg.text}</p>
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
          <div className="flex justify-end mb-4">
            <span className="text-xs text-white/60">:31</span>
          </div>

          <div className="space-y-4">
            {/* Mensagens anteriores (com blur) */}
            {previousMessages.map((msg, index) => renderMessage(msg, index, true))}

            {/* Mensagens principais (sem blur) */}
            {chatMessages.map((msg, index) => renderMessage(msg, index, false))}
          </div>
        </div>
      </div>
      {showPopup && <AccessPopup username={username} onClose={() => setShowPopup(false)} />}
    </>
  );
}

