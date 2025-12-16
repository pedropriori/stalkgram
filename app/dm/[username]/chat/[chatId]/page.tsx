import { getInstagramData } from "@/app/lib/instagram-data";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import ChatMessages from "@/app/components/chat-messages";

interface PageParams {
  username?: string;
  chatId?: string;
}

interface ChatMessage {
  type: "other" | "me";
  text: string;
  blurred?: boolean;
  duration?: string;
}

interface StoredFollowingUser {
  id: string;
  username: string;
  profilePicUrl: string;
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

// Templates de roteiros de chat (ciúme + flerte + intuição de traição)
const chatTemplates: { previous: ChatMessage[]; main: ChatMessage[] }[] = [
  {
    // Template 1: viu ontem, fingiu que não viu
    previous: [
      { type: "other", text: "você não me respondeu ontem…", blurred: true },
      { type: "me", text: "desculpa, tava ocupado", blurred: true },
      { type: "other", text: "ocupado com o quê?", blurred: true },
      { type: "me", text: "nada demais, só trabalho", blurred: true },
      { type: "other", text: "hmm… acredito", blurred: true },
      { type: "other", text: "voice", duration: "0:15", blurred: true },
    ],
    main: [
      { type: "other", text: "você tava onde ontem? 🤨" },
      { type: "me", text: "eu? nada… por quê?" },
      { type: "other", text: "porque eu vi você e fingi que não vi…" },
      { type: "me", text: "você viu mesmo? kkk" },
      { type: "other", text: "não faz essa cara de inocente…" },
      { type: "other", text: "voice", duration: "0:27" },
      { type: "me", text: "voice", duration: "1:12" },
      { type: "other", text: "tá… então hoje você me deve uma coisa." },
      { type: "me", text: "depende do que for 😅" },
    ],
  },
  {
    // Template 2: curtidas e stories
    previous: [
      { type: "other", text: "você curtiu tudo denovo…", blurred: true },
      { type: "me", text: "é só amizade, relaxa", blurred: true },
      { type: "other", text: "engraçado, comigo você não reage assim", blurred: true },
      { type: "me", text: "para, você sabe que é diferente", blurred: true },
      { type: "other", text: "diferente como? 🤔", blurred: true },
      { type: "me", text: "voice", duration: "0:41", blurred: true },
    ],
    main: [
      { type: "other", text: "não achei graça daquele story de ontem…" },
      { type: "me", text: "qual deles? 😅" },
      { type: "other", text: "o que você marcou 'melhor companhia'…" },
      { type: "me", text: "exagera não, foi zoeira" },
      { type: "other", text: "zoeira pra quem lê… pra mim não foi" },
      { type: "other", text: "voice", duration: "0:32" },
      { type: "me", text: "voice", duration: "1:03" },
      { type: "other", text: "tá… então prova que é só zoeira." },
      { type: "me", text: "cuidado com o que você pede 👀" },
    ],
  },
  {
    // Template 3: sumiço e segredo
    previous: [
      { type: "me", text: "cheguei em casa agora", blurred: true },
      { type: "other", text: "demorou hein…", blurred: true },
      { type: "me", text: "nem foi tudo isso", blurred: true },
      { type: "other", text: "pra quem sumiu o dia todo foi sim", blurred: true },
      { type: "other", text: "voice", duration: "0:19", blurred: true },
    ],
    main: [
      { type: "other", text: "se eu perguntar com quem você tava, você responde?" },
      { type: "me", text: "depende se você vai ficar com ciúmes ou não 😏" },
      { type: "other", text: "então já sei que não vou gostar da resposta" },
      { type: "me", text: "calma… não foi nada demais" },
      { type: "other", text: "engraçado, sempre é 'nada demais'" },
      { type: "me", text: "voice", duration: "0:54" },
      { type: "other", text: "voice", duration: "0:47" },
      { type: "other", text: "só me promete uma coisa: não mente pra mim." },
      { type: "me", text: "então não pergunta tudo 👀" },
    ],
  },
];

function getDeterministicChatTemplate(seed: string): { previous: ChatMessage[]; main: ChatMessage[] } {
  const hash = hashString(seed);
  return chatTemplates[hash % chatTemplates.length];
}

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

  // Se o perfil for privado e não tiver dados de seguidos, redirecionar para vendas
  if (profile.isPrivate && !hasFollowing) {
    redirect(`/vendas/${profile.username}`);
  }

  const cookieStore = await cookies();
  const followingCookieName = `sg_dm_following_${username}`;
  const existingFollowingCookie = cookieStore.get(followingCookieName)?.value ?? "";

  let storedFollowingUsers: StoredFollowingUser[] = [];

  if (existingFollowingCookie) {
    try {
      storedFollowingUsers = JSON.parse(
        decodeURIComponent(existingFollowingCookie),
      ) as StoredFollowingUser[];
    } catch {
      storedFollowingUsers = [];
    }
  }

  if (storedFollowingUsers.length === 0 && hasFollowing) {
    const sorted = [...data.followingSample].sort((a, b) => {
      const hashA = hashString(a.username);
      const hashB = hashString(b.username);
      if (hashA === hashB) {
        return a.username.localeCompare(b.username);
      }
      return hashA - hashB;
    });

    const sliced = sorted.slice(0, 15);

    storedFollowingUsers = sliced.map((user) => ({
      id: String(user.id),
      username: user.username,
      profilePicUrl: user.profilePicUrl,
    }));
  }

  const followingUsers = storedFollowingUsers;

  const chatUserFromList = followingUsers.find(
    (user) => user.username === chatId,
  );
  const chatUserFallback = followingUsers.length > 0 ? followingUsers[0] : null;
  const chatUser = chatUserFromList ?? chatUserFallback ?? {
    id: chatId,
    username: chatId,
    fullName: chatId,
    profilePicUrl: profile.profilePicUrl,
  };

  const templateSeed = `${username}-${chatUser.username}-chat-template`;
  const chosenTemplate = getDeterministicChatTemplate(templateSeed);

  // Garantir que estamos usando o primeiro usuário da lista ordenada
  // Se o chatId (username) não corresponder ao primeiro, ainda assim usamos o primeiro
  // para manter consistência com a lista de DM

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-md bg-black flex flex-col h-screen">
        {/* Header do Chat */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-black px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/dm/${username}`}
              className="flex items-center"
              suppressHydrationWarning
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
          previousMessages={chosenTemplate.previous}
          chatMessages={chosenTemplate.main}
          username={username}
          otherUserProfilePicUrl={chatUser.profilePicUrl}
          otherUserUsername={chatUser.username}
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
    const data = await getInstagramData(username);
    return { data, error: "" };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao buscar dados do Instagram.";
    return { data: null, error: message };
  }
}

