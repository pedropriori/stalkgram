import { getInstagramDataOrMock } from "@/app/lib/instagram-data-fallback";
import Image from "next/image";
import Link from "next/link";
import FeedInteractions from "@/app/components/feed-interactions";
import FeedPost from "@/app/components/feed-post";
import StoriesSection from "@/app/components/stories-section";
import ProfileHeader from "@/app/components/profile-header";
import SetCompletionCookie from "@/app/components/set-completion-cookie";
import BottomNavigation from "@/app/components/bottom-navigation";

interface PageParams {
  username?: string;
}

async function resolveParams(params: unknown): Promise<PageParams> {
  const resolved = await Promise.resolve(params as PageParams);
  return resolved || {};
}

function maskUsername(username: string): string {
  if (!username || typeof username !== 'string' || username.length === 0) {
    return "u*****";
  }
  // Remover espaços e garantir processamento consistente
  const trimmed = username.trim();
  if (trimmed.length === 0) {
    return "u*****";
  }
  // Pular caracteres especiais no início (como _) para pegar a primeira letra válida
  // Usar regex para encontrar primeira letra ou número
  const match = trimmed.match(/[a-z0-9]/i);
  if (match && match[0]) {
    return `${match[0].toLowerCase()}*****`;
  }
  // Se não encontrou letra/número válido, usar primeiro caractere (garantir ASCII)
  const firstChar = trimmed.charAt(0);
  // Converter para ASCII seguro
  const safeChar = firstChar.charCodeAt(0) < 128 ? firstChar.toLowerCase() : 'u';
  return `${safeChar}*****`;
}

function maskFullName(fullName: string | null | undefined, username: string): string {
  if (fullName && typeof fullName === 'string' && fullName.trim().length > 0) {
    const trimmed = fullName.trim();
    // Encontrar primeira letra ou número válido
    const match = trimmed.match(/[a-z0-9]/i);
    if (match && match[0]) {
      return `${match[0].toLowerCase()}*****`;
    }
    // Fallback seguro para ASCII
    const firstChar = trimmed.charAt(0);
    const safeChar = firstChar.charCodeAt(0) < 128 ? firstChar.toLowerCase() : 'u';
    return `${safeChar}*****`;
  }
  return maskUsername(username);
}

function getRandomLikes(): number {
  return Math.floor(Math.random() * 100) + 10; // Entre 10 e 109
}

function getRandomDate(): string {
  const daysAgo = Math.floor(Math.random() * 30) + 1; // Entre 1 e 30 dias atrás
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function getRandomComment() {
  const commentOptions = [
    "partiu com sempre",
    "que top",
    "incrível",
    "amando isso",
    "perfeito",
    "demais",
    "top demais",
    "sensacional",
    "maravilhoso",
    "incrível mesmo",
    "que foto linda",
    "arrasou",
    "perfeição",
    "amei",
    "que lugar incrível"
  ];

  const emojiOptions = [
    { emojis: "❤️❤️", count: 2 },
    { emojis: "❤️", count: 1 },
    { emojis: "❤️❤️❤️", count: 3 },
    { emojis: "💗💗", count: 2 },
    { emojis: "🔥🔥", count: 2 },
    { emojis: "✨✨", count: 2 },
    { emojis: "😍😍", count: 2 },
    { emojis: "💕💕", count: 2 },
    { emojis: "❤️🔥", count: 2 },
    { emojis: "💖💖", count: 2 }
  ];

  const textSizeOptions = ["text-xs", "text-sm", "text-base"];

  const text = commentOptions[Math.floor(Math.random() * commentOptions.length)];
  const emoji = emojiOptions[Math.floor(Math.random() * emojiOptions.length)];
  const textSize = textSizeOptions[Math.floor(Math.random() * textSizeOptions.length)];

  return {
    text,
    emojis: emoji.emojis,
    textSize
  };
}

export default async function PerfilPage({ params }: { params: PageParams | Promise<PageParams> }) {
  const resolved = await resolveParams(params);
  const username = resolved.username ?? "";
  if (!username) {
    return (
      <main className="min-h-screen bg-[#0b1014] text-white">
        <div className="mx-auto flex max-w-md flex-col">
          <div className="rounded-2xl border border-white/10 bg-rose-500/10 p-5 text-rose-100">
            <p className="text-lg font-semibold">Username não informado.</p>
            <p className="mt-2 text-sm text-rose-50/90">Acesse via /perfil/@usuario.</p>
          </div>
        </div>
      </main>
    );
  }

  const result = await getProfileData(username);
  if (!result.data) {
    return (
      <main className="min-h-screen bg-[#0b1014] text-white">
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
      <main className="min-h-screen bg-[#0b1014] text-white">
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

  // Removido redirect para /vendas - agora usamos mock quando necessário

  const maskedProfileUsername = maskUsername(profile.username);
  const maskedProfileName = maskFullName(profile.fullName, profile.username);

  // Usar primeiros 12 perfis para stories, com repetição determinística se necessário
  // (perfis diferentes das mensagens da DM)
  // Com o novo sistema de fallback, sempre teremos followings (reais ou mock)
  const baseFollowingUsers = data.followingSample.slice(0, 12);

  // Função para repetir perfis de forma determinística
  function getProfilsWithRepetition<T>(profiles: T[], count: number, seed: string): T[] {
    if (profiles.length === 0) return [];
    if (profiles.length >= count) return profiles.slice(0, count);

    // Repetir de forma determinística baseada no seed
    function hashString(str: string): number {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash);
    }

    const result: T[] = [];
    const hash = hashString(seed);
    let position = hash % profiles.length;

    for (let i = 0; i < count; i++) {
      result.push(profiles[position]);
      position = (position + (hash % 3) + 1) % profiles.length;
    }

    return result;
  }

  const followingUsers = getProfilsWithRepetition(
    baseFollowingUsers,
    Math.max(baseFollowingUsers.length, 10), // Pelo menos 10 perfis para o feed
    `${profile.username}-profile-stories`,
  );

  return (
    <main className="min-h-screen bg-[#0b1014] text-white">
      <SetCompletionCookie />
      <div className="mx-auto max-w-md bg-[#0b1014] pb-16">
        {/* Header Instagram */}
        <ProfileHeader username={username} />

        {/* Stories Section */}
        <div className="border-b border-white/10 bg-[#0b1014] px-4 py-3">
          <StoriesSection
            profilePicUrl={profile.profilePicUrl}
            profileName={maskedProfileName}
            followingUsers={followingUsers}
            username={username}
          />
        </div>

        {/* Feed com posts bloqueados - scrollável */}
        <div className="bg-[#0b1014]">
          {followingUsers.length > 0 ? (
            <FeedInteractions username={username}>
              <div className="space-y-0">
                {followingUsers.map((user, index) => {
                  const randomLikes = getRandomLikes();
                  const randomDate = getRandomDate();
                  const randomComments = Math.floor(Math.random() * 5) + 1;
                  const randomShares = Math.floor(Math.random() * 3) + 1;
                  const randomComment = getRandomComment();
                  return (
                    <FeedPost
                      key={`post-${user.id}-${index}`}
                      user={user}
                      randomLikes={randomLikes}
                      randomDate={randomDate}
                      randomComments={randomComments}
                      randomShares={randomShares}
                      randomComment={randomComment}
                      profileUsername={profile.username}
                    />
                  );
                })}
              </div>
            </FeedInteractions>
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center px-4 py-10 text-center">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-4 text-white/40"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <p className="text-lg font-semibold text-white">Conteúdo restrito</p>
              <p className="mt-2 text-sm text-white/60">
                {new Date().toLocaleDateString("pt-BR")} - {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation
          profilePicUrl={profile.profilePicUrl}
          maskedProfileName={maskedProfileName}
          username={username}
        />
      </div>
    </main>
  );
}

async function getProfileData(username: string) {
  try {
    const result = await getInstagramDataOrMock(username);
    return { data: result.data, error: "", usedMock: result.usedMock };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao buscar dados do Instagram.";
    return { data: null, error: message, usedMock: false };
  }
}

