"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MatrixBackground from "@/app/components/matrix-background";
import { setGenderCookie, getTemporaryGender } from "@/app/lib/gender";

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

export default function UsernamePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGender, setHasGender] = useState(false);

  useEffect(() => {
    // Verificar se há gênero selecionado
    const gender = getTemporaryGender();
    if (!gender) {
      // Se não houver gênero, redirecionar para página de gênero
      router.push("/genero");
      return;
    }
    setHasGender(true);
  }, [router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanUsername = username.replace("@", "").trim();
    if (!cleanUsername || isLoading) return;

    // Verificar se há username permitido
    const allowedUsername = getAllowedUsername();
    if (allowedUsername) {
      router.push(`/vendas/${allowedUsername}`);
      return;
    }

    // Obter gênero temporário e associar ao username
    const gender = getTemporaryGender();
    if (gender) {
      // Armazenar gênero associado ao username (formato simplificado)
      setGenderCookie(cleanUsername, gender);
      
      // Limpar cookie temporário
      if (typeof document !== "undefined") {
        document.cookie = "sg_selected_gender=; path=/; max-age=0";
      }
    }

    setIsLoading(true);
    router.push(`/confirmar/${cleanUsername}`);
  }

  // Se não tiver gênero, mostrar loading enquanto redireciona
  if (!hasGender) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <MatrixBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
          <div className="rounded-3xl bg-[#0b1014]/80 backdrop-blur-sm p-8 shadow-2xl border border-white/10 max-w-md w-full">
            <p className="text-white text-center">Carregando...</p>
          </div>
        </div>
      </main>
    );
  }

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

            {/* Título */}
            <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4">
              Qual o @ do perfil?
            </h1>

            {/* Subtítulo */}
            <p className="text-sm sm:text-base text-white/80 text-center mb-6">
              Digite o username do perfil que você deseja espionar.
            </p>

            {/* Formulário */}
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
                  placeholder="Digite o @ da pessoa"
                  className="w-full rounded-2xl border border-white/20 bg-white/10 px-12 py-4 text-base text-white placeholder:text-white/50 outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:opacity-50"
                  required
                  autoFocus
                  disabled={isLoading}
                  aria-label="Digite o @ da pessoa"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-pink-500 hover:text-pink-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
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

              {/* Botão de submit alternativo */}
              <button
                type="submit"
                disabled={isLoading || !username.trim()}
                className="w-full rounded-2xl bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 px-6 py-4 flex items-center justify-center gap-2 text-white font-semibold text-lg transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
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
                    <span>Buscando...</span>
                  </>
                ) : (
                  <>
                    <svg
                      width="20"
                      height="20"
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
                    Continuar
                  </>
                )}
              </button>

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

            {/* Botão voltar */}
            <button
              onClick={() => router.push("/genero")}
              className="mt-6 w-full text-center text-white/60 hover:text-white/80 text-sm transition"
              aria-label="Voltar para seleção de gênero"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

