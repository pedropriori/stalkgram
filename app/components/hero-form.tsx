"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

function getAllowedUsername(): string | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const trimmedCookie = cookie.trim();
    if (trimmedCookie.startsWith("sg_allowed_username=")) {
      const parts = trimmedCookie.split("=");
      if (parts.length === 2 && parts[1]) {
        return parts[1];
      }
    }
  }
  return null;
}

export default function HeroForm() {
  const router = useRouter();
  const [profileCount, setProfileCount] = useState(8516);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const incrementCount = () => {
      setProfileCount((prev) => prev + 1);

      // Velocidade variável: às vezes rápido (200-600ms), às vezes devagar (1500-4000ms)
      const isFast = Math.random() > 0.4; // 60% chance de ser rápido
      const delay = isFast
        ? Math.random() * 400 + 200 // 200-600ms
        : Math.random() * 2500 + 1500; // 1500-4000ms

      timeoutId = setTimeout(incrementCount, delay);
    };

    // Começar após um pequeno delay inicial
    timeoutId = setTimeout(incrementCount, 1000);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);


  function handleCardClick() {
    const allowedUsername = getAllowedUsername();
    if (allowedUsername) {
      router.push(`/vendas/${allowedUsername}`);
      return;
    }

    // Redirecionar para página de seleção de gênero
    router.push("/genero");
  }

  return (
    <div className="rounded-3xl bg-[#0b1014]/80 backdrop-blur-sm p-8 shadow-2xl border border-white/10">
      {/* Logo */}
      <div className="flex items-center justify-center mb-1">
        <Image
          src="/images/logo.png"
          alt="StalkGram Logo"
          width={180}
          height={66}
          className="h-auto w-auto"
          priority
        />
      </div>

      {/* Título */}
      <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4">
        O que realmente ele(a) faz quando tá no Insta?
      </h1>

      {/* Subtítulo */}
      <p className="text-sm text-white/80 text-center mb-6">
        Descubra a verdade sobre qualquer pessoa do Instagram. Só com o @.
      </p>

      {/* Botão */}
      <button
        onClick={handleCardClick}
        className="w-full rounded-2xl bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 px-6 py-4 flex items-center justify-center gap-2 text-white font-semibold text-lg transition-transform hover:scale-105"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        Espionar Agora
      </button>

      {/* Disclaimer */}
      <div className="mt-6 space-y-2">
        <p className="text-xs text-white/60 text-center">
          100% Anônimo. A pessoa <span className="text-pink-500 font-bold">NUNCA</span> saberá.
        </p>
        <p className="text-xs text-white/80 text-center">
          +{profileCount.toLocaleString('pt-BR')} perfis analisados hoje
        </p>
      </div>
    </div>
  );
}

