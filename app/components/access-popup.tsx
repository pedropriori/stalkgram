'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AccessPopupProps {
  username?: string;
  onClose?: () => void;
  onContinue?: () => void;
}

export default function AccessPopup({ username, onClose, onContinue }: AccessPopupProps) {
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter();

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  const handleContinue = () => {
    setIsVisible(false);
    if (onContinue) {
      onContinue();
    } else if (username) {
      router.push(`/vendas/${username}`);
    } else {
      router.push('/');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center bg-black/50 p-4 animate-slide-down">
      <div className="bg-red-600 rounded-lg p-3 max-w-[280px] w-full relative shadow-2xl">
        {/* Botão fechar */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-white hover:text-gray-200 transition"
          aria-label="Fechar"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>

        {/* Conteúdo */}
        <div className="pr-5">
          <div className="mb-2">
            <p className="text-white text-xs font-medium mb-0.5">
              No momento o seu acesso só permite
            </p>
            <p className="text-white text-xs font-medium">
              visualização do conteúdo.
            </p>
          </div>
          <div className="mb-3">
            <p className="text-white text-[10px] leading-tight">
              Para poder mexer e ver de forma completa
            </p>
            <p className="text-white text-[10px] leading-tight">
              adquira a ferramenta do StalkGram.
            </p>
          </div>
        </div>

        {/* Botão continuar */}
        <div className="flex justify-end">
          <button
            onClick={handleContinue}
            className="bg-red-700 hover:bg-red-800 rounded-full p-2 text-white transition"
            aria-label="Continuar"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

