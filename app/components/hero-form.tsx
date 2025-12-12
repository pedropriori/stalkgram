'use client';

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Função para verificar se o cookie existe
function hasCompletedProcess(): boolean {
  if (typeof document === 'undefined') return false;
  const cookies = document.cookie.split(';');
  return cookies.some(cookie => cookie.trim().startsWith('deepgram_completed=true'));
}

export default function HeroForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [showInput, setShowInput] = useState(false);
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanUsername = username.replace("@", "").trim();
    if (!cleanUsername) return;
    
    // Verificar se já completou o processo
    if (hasCompletedProcess()) {
      // Redirecionar direto para a página de vendas
      router.push(`/vendas/${cleanUsername}`);
    } else {
      // Fluxo normal
      router.push(`/confirmar/${cleanUsername}`);
    }
  }

  function handleCardClick() {
    setShowInput(true);
  }

  return (
    <div className="rounded-3xl bg-black/80 backdrop-blur-sm p-8 shadow-2xl border border-white/10">
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

      {/* Input ou Botão */}
      {!showInput ? (
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
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500 text-xl font-bold">
              @
            </div>
            <input
              id="username"
              name="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Digite o @ da pessoa."
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-12 py-4 text-base text-white placeholder:text-white/50 outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              required
              autoFocus
              aria-label="Digite o @ da pessoa"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-pink-500 hover:text-pink-400 transition"
              aria-label="Buscar perfil"
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
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Aviso */}
          <div className="flex items-center justify-center gap-2 text-sm text-white/70">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-pink-500 shrink-0"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
            <span>Apenas 1 pesquisa por pessoa.</span>
          </div>
        </form>
      )}

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

