import scrapeInstagram from "@/app/api/instagram/instagram-scraper";
import Image from "next/image";
import Link from "next/link";
import ChatMessages from "@/app/components/chat-messages";

interface PageParams {
  username?: string;
  chatId?: string;
}

async function resolveParams(params: unknown): Promise<PageParams> {
  const resolved = await Promise.resolve(params as PageParams);
  return resolved || {};
}

function maskUsername(username: string): string {
  if (!username || username.length === 0) return "u*****";
  const firstChar = username.charAt(0).toLowerCase();
  return `${firstChar}*****`;
}

// Função para gerar um número determinístico baseado em uma string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Mensagens anteriores (com blur) - aparecem ao fazer scroll para cima
const previousMessages = [
  { type: "other" as const, text: "você não me respondeu ontem…", blurred: true },
  { type: "me" as const, text: "desculpa, tava ocupado", blurred: true },
  { type: "other" as const, text: "ocupado com o quê?", blurred: true },
  { type: "me" as const, text: "nada demais, só trabalho", blurred: true },
  { type: "other" as const, text: "hmm… acredito", blurred: true },
  { type: "other" as const, text: "voice", duration: "0:15", blurred: true },
];

// Mensagens principais (sem blur) - storytelling completo
const chatMessages = [
  { type: "other" as const, text: "você tava onde ontem? 🤨", blurred: false },
  { type: "me" as const, text: "eu? nada… por quê?", blurred: false },
  { type: "other" as const, text: "porque eu vi você e fingi que não vi…", blurred: false },
  { type: "me" as const, text: "você viu mesmo? kkk", blurred: false },
  { type: "other" as const, text: "não faz essa cara de inocente…", blurred: false },
  { type: "other" as const, text: "voice", duration: "0:27", blurred: false },
  { type: "me" as const, text: "voice", duration: "1:12", blurred: false },
  { type: "other" as const, text: "tá… então hoje você me deve uma coisa.", blurred: false },
  { type: "me" as const, text: "depende do que for 😅", blurred: false },
];

export default async function ChatPage({ params }: { params: PageParams | Promise<PageParams> }) {
  const resolved = await resolveParams(params);
  const username = resolved.username ?? "";
  const chatId = resolved.chatId ?? ""; // Agora chatId é o username do usuário seguido

  if (!username || !chatId) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto flex max-w-md flex-col">
          <div className="rounded-2xl border border-white/10 bg-rose-500/10 p-5 text-rose-100">
            <p className="text-lg font-semibold">Parâmetros inválidos.</p>
          </div>
        </div>
      </main>
    );
  }

  const result = await getProfileData(username);
  if (!result.data) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto flex max-w-md flex-col">
          <div className="rounded-2xl border border-white/10 bg-rose-500/10 p-5 text-rose-100">
            <p className="text-lg font-semibold">Não foi possível carregar</p>
            <p className="mt-2 text-sm text-rose-50/90">{result.error}</p>
          </div>
        </div>
      </main>
    );
  }

  const data = result.data;
  const profile = data.profile;
  const hasFollowing = data.followingSample.length > 0;
  // Ordenar de forma determinística baseado apenas no hash do username
  // Isso garante que mesmo se o scraper retornar em ordem diferente, a ordem aqui será sempre a mesma
  const followingUsers = hasFollowing 
    ? [...data.followingSample].sort((a, b) => {
        const hashA = hashString(a.username);
        const hashB = hashString(b.username);
        if (hashA === hashB) {
          return a.username.localeCompare(b.username);
        }
        return hashA - hashB;
      })
    : [];
  
  // IMPORTANTE: Sempre usar o primeiro usuário da lista ordenada (mesmo que aparece na primeira posição da DM)
  // Isso garante que a foto seja sempre a mesma, independente do chatId na URL
  // A lista já vem ordenada de forma determinística do scraper
  const chatUser = followingUsers.length > 0 ? followingUsers[0] : {
    id: chatId,
    username: chatId,
    fullName: chatId,
    profilePicUrl: profile.profilePicUrl,
  };
  
  // Garantir que estamos usando o primeiro usuário da lista ordenada
  // Se o chatId (username) não corresponder ao primeiro, ainda assim usamos o primeiro
  // para manter consistência com a lista de DM

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-md bg-black flex flex-col h-screen">
        {/* Header do Chat */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-black px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href={`/dm/${username}`} className="flex items-center">
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
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Link>
            <div className="relative">
              <div className="h-10 w-10 rounded-full p-[2px] bg-gradient-to-br from-orange-500 to-yellow-500 overflow-hidden">
                <div className="h-full w-full rounded-full bg-gray-300 overflow-hidden">
                  <Image
                    src={chatUser.profilePicUrl}
                    alt={maskUsername(chatUser.username)}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">
                {maskUsername(chatUser.username)}
              </span>
              <span className="text-xs text-green-500">online</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
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
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
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
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
        </header>

        {/* Área de Chat */}
        <ChatMessages
          previousMessages={previousMessages}
          chatMessages={chatMessages}
          username={username}
        />

        {/* Barra de Input */}
        <div className="border-t border-white/10 bg-black px-4 py-3">
          <div className="flex items-center gap-3">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/60"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <input
              type="text"
              placeholder="Mensagem..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/60 outline-none"
            />
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/60"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/60"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/60"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </div>
        </div>
      </div>
    </main>
  );
}

async function getProfileData(username: string) {
  try {
    const data = await scrapeInstagram(username);
    return { data, error: "" };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao buscar dados do Instagram.";
    return { data: null, error: message };
  }
}

