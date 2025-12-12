'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import MatrixBackground from '@/app/components/matrix-background';

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const username = (params?.username as string) || '';
  const [password, setPassword] = useState('........');
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Animar os pontos da senha para simular teste de combinações
    const interval = setInterval(() => {
      setPassword((prev) => {
        const dots = prev.split('');
        // Mudar aleatoriamente alguns pontos para simular tentativas
        const numChanges = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numChanges; i++) {
          const randomIndex = Math.floor(Math.random() * dots.length);
          // Alternar entre diferentes caracteres para simular teste
          dots[randomIndex] = Math.random() > 0.7 ? '•' : '.';
        }
        return dots.join('');
      });
    }, 150);

    // Após alguns segundos, redirecionar para o perfil
    const timeout = setTimeout(() => {
      setIsAnimating(false);
      router.push(`/perfil/${username}`);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [username, router]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      <MatrixBackground />
      {/* Película escura sobre a animação */}
      <div className="absolute inset-0 z-[1] bg-black/90"></div>
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Logo Instagram */}
          <div className="flex justify-center mb-8">
            <Image
              src="/logo-insta.webp"
              alt="Instagram"
              width={175}
              height={60}
              className="h-auto"
              priority
            />
          </div>

          {/* Campos de Login */}
          <div className="space-y-3 mb-4">
            {/* Username */}
            <input
              type="text"
              value={username}
              readOnly
              className="w-full rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-gray-600"
            />

            {/* Password com animação */}
            <div className="relative">
              <input
                type="text"
                value={password}
                readOnly
                className="w-full rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3 text-white font-mono tracking-wider focus:outline-none focus:border-gray-600"
                style={{ letterSpacing: '4px' }}
              />
            </div>
          </div>

          {/* Caixa de Informação */}
          <div className="mb-4 rounded-lg bg-gray-800/50 border border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="shrink-0 relative w-6 h-6">
                {/* Primeira flecha - girando no sentido horário */}
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-orange-500 absolute inset-0"
                  style={{ 
                    animation: 'arrow-rotate 1.2s ease-in-out infinite',
                    transformOrigin: 'center'
                  }}
                >
                  <path
                    d="M12 3L9 6H11V9H13V6H15L12 3Z"
                    fill="currentColor"
                  />
                </svg>
                {/* Segunda flecha - girando no sentido anti-horário */}
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-orange-500 absolute inset-0"
                  style={{ 
                    animation: 'arrow-rotate-reverse 1.2s ease-in-out infinite',
                    animationDelay: '0.6s',
                    transformOrigin: 'center'
                  }}
                >
                  <path
                    d="M12 21L15 18H13V15H11V18H9L12 21Z"
                    fill="currentColor"
                    opacity="0.75"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-white font-medium">
                  Quebrando criptografia da conta
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Testando combinações de senha...
                </p>
              </div>
            </div>
          </div>

          {/* Botão Entrar */}
          <button
            disabled
            className="w-full rounded-lg bg-blue-500 px-4 py-3 text-white font-semibold opacity-50 cursor-not-allowed mb-4"
          >
            Entrar
          </button>

          {/* Esqueceu a senha */}
          <div className="text-center mb-6">
            <a href="#" className="text-sm text-blue-500 hover:text-blue-400">
              Esqueceu a senha?
            </a>
          </div>

          {/* Separador OU */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-700"></div>
            <span className="text-sm text-gray-400">OU</span>
            <div className="flex-1 h-px bg-gray-700"></div>
          </div>

          {/* Botão Facebook */}
          <button
            disabled
            className="w-full rounded-lg bg-transparent border border-gray-700 px-4 py-3 text-white font-semibold flex items-center justify-center gap-2 opacity-50 cursor-not-allowed mb-6"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-blue-500"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Entrar com o Facebook
          </button>

          {/* Cadastre-se */}
          <div className="text-center">
            <span className="text-sm text-gray-400">Não tem uma conta? </span>
            <a href="#" className="text-sm text-blue-500 hover:text-blue-400">
              Cadastre-se.
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

