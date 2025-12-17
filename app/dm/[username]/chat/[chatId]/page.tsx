import { getInstagramData } from "@/app/lib/instagram-data";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import ChatMessages from "@/app/components/chat-messages";
import { ClearLoadingOnMount } from "@/app/components/clear-loading-on-mount";
import { getDeterministicChatTemplate, hashString } from "@/app/lib/chat-templates";
import { getUserCity } from "@/app/lib/location";
import type { ChatMessage } from "@/app/lib/chat-templates/types";

interface PageParams {
  username?: string;
  chatId?: string;
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

  // Validação adicional de segurança: garantir que o username corresponde
  if (profile.username.toLowerCase() !== username.toLowerCase()) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto flex max-w-md flex-col">
          <div className="rounded-2xl border border-white/10 bg-rose-500/10 p-5 text-rose-100">
            <p className="text-lg font-semibold">Erro de validação</p>
            <p className="mt-2 text-sm text-rose-50/90">
              Username solicitado não corresponde aos dados retornados.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Se o perfil for privado e não tiver dados de seguidos, redirecionar para vendas
  // Usar o username da URL, não do cache, para garantir correção
  if (profile.isPrivate && !hasFollowing) {
    redirect(`/vendas/${username}`);
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

  // Obter cidade do usuário
  let resolvedCity = "Maringá";
  try {
    // Buscar cidade sem IP específico (a API detecta automaticamente)
    const city = await getUserCity();
    if (city) {
      resolvedCity = city;
    }
  } catch (error) {
    // Se falhar ao obter cidade, usar fallback
    console.error("Erro ao obter cidade do usuário:", error);
  }

  const chosenTemplateWithCity = applyCityToTemplate(chosenTemplate, resolvedCity);

  // Garantir que estamos usando o primeiro usuário da lista ordenada
  // Se o chatId (username) não corresponder ao primeiro, ainda assim usamos o primeiro
  // para manter consistência com a lista de DM

  return (
    <main className="min-h-screen bg-black text-white">
      <ClearLoadingOnMount />
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
                  <div className="h-full w-full rounded-full overflow-hidden blur-xs">
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
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">
                {maskUsername(chatUser.username)}
              </span>
              <span className="text-xs text-gray-400">online</span>
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
          previousMessages={chosenTemplateWithCity.previous}
          chatMessages={chosenTemplateWithCity.main}
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

function applyCityToTemplate(template: { previous: ChatMessage[]; main: ChatMessage[] }, city: string) {
  const replaceCity = (message: ChatMessage): ChatMessage => {
    const replaceText = (value: string) => value.replace(/{{city}}/g, city);

    const textIncludesCity = message.text?.includes("{{city}}");
    const fullTextIncludesCity = message.fullText?.includes("{{city}}");

    if (!textIncludesCity && !fullTextIncludesCity) {
      return message;
    }

    return {
      ...message,
      ...(textIncludesCity && { text: replaceText(message.text) }),
      ...(fullTextIncludesCity && message.fullText && { fullText: replaceText(message.fullText) }),
    };
  };

  return {
    previous: template.previous.map(replaceCity),
    main: template.main.map(replaceCity),
  };
}

