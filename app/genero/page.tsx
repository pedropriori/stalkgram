"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MatrixBackground from "@/app/components/matrix-background";
import { setGenderCookie } from "@/app/lib/gender";

export default function GeneroPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGender, setSelectedGender] = useState<"masculino" | "feminino" | null>(null);

  const handleGenderSelect = (gender: "masculino" | "feminino") => {
    if (isLoading) return;

    setSelectedGender(gender);
    setIsLoading(true);

    // Armazenar gênero temporariamente (sem username ainda)
    // Usaremos um cookie temporário que será associado ao username depois
    if (typeof document !== "undefined") {
      document.cookie = `sg_selected_gender=${gender}; path=/; max-age=600; SameSite=Lax`;
    }

    // Pequeno delay para feedback visual
    setTimeout(() => {
      router.push("/username");
    }, 300);
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <MatrixBackground />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="rounded-3xl bg-[#0b1014]/80 backdrop-blur-sm p-6 sm:p-8 shadow-2xl border border-white/10">
            {/* Logo */}
            <div className="flex items-center justify-center mb-6">
              <Image
                src="/images/logo.png"
                alt="StalkGram Logo"
                width={180}
                height={66}
                className="h-auto w-auto"
                priority
              />
            </div>

            {/* Headline */}
            <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">
              Cada perfil se comporta de um jeito
            </h1>

            {/* Subheadline */}
            <p className="text-sm sm:text-base text-white/80 text-center mb-8">
              Informe o gênero do perfil para exibirmos padrões e informações mais precisas da atividade no Instagram.
            </p>

            {/* Botões de Seleção */}
            <div className="space-y-4">
              <button
                onClick={() => handleGenderSelect("masculino")}
                disabled={isLoading}
                className={`w-full rounded-2xl px-6 py-4 flex items-center justify-center gap-3 text-white font-semibold text-lg transition-all ${selectedGender === "masculino"
                    ? "bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 scale-105"
                    : "bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 hover:scale-105 opacity-90 hover:opacity-100"
                  } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                aria-label="Selecionar gênero masculino"
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
                  className="shrink-0"
                >
                  <circle cx="10" cy="7" r="4" />
                  <path d="M10 14v7" />
                  <path d="M7 18h6" />
                </svg>
                Masculino
              </button>

              <button
                onClick={() => handleGenderSelect("feminino")}
                disabled={isLoading}
                className={`w-full rounded-2xl px-6 py-4 flex items-center justify-center gap-3 text-white font-semibold text-lg transition-all ${selectedGender === "feminino"
                    ? "bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 scale-105"
                    : "bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 hover:scale-105 opacity-90 hover:opacity-100"
                  } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                aria-label="Selecionar gênero feminino"
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
                  className="shrink-0"
                >
                  <circle cx="12" cy="8" r="5" />
                  <path d="M20 21a8 8 0 1 0-16 0" />
                </svg>
                Feminino
              </button>
            </div>

            {/* Loading indicator */}
            {isLoading && (
              <div className="mt-6 flex items-center justify-center gap-2 text-white/70">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-sm">Carregando...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}



