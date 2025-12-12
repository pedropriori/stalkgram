import scrapeInstagram from "@/app/api/instagram/instagram-scraper";
import Image from "next/image";
import Link from "next/link";
import FeedInteractions from "@/app/components/feed-interactions";
import FeedPost from "@/app/components/feed-post";
import StoriesSection from "@/app/components/stories-section";
import ProfileHeader from "@/app/components/profile-header";
import SetCompletionCookie from "@/app/components/set-completion-cookie";

interface PageParams {
  username?: string;
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

function maskFullName(fullName: string | null | undefined, username: string): string {
  if (fullName && fullName.length > 0) {
    const firstChar = fullName.charAt(0).toLowerCase();
    return `${firstChar}*****`;
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
      <main className="min-h-screen bg-black text-white">
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
  const maskedProfileUsername = maskUsername(profile.username);
  const maskedProfileName = maskFullName(profile.fullName, profile.username);
  const followingUsers = hasFollowing ? data.followingSample : [];

  return (
    <main className="min-h-screen bg-black text-white">
      <SetCompletionCookie />
      <div className="mx-auto max-w-md bg-black pb-16">
        {/* Header Instagram */}
        <ProfileHeader username={username} />

        {/* Stories Section */}
        <div className="border-b border-white/10 bg-black px-4 py-3">
          <StoriesSection
            profilePicUrl={profile.profilePicUrl}
            profileName={maskedProfileName}
            followingUsers={followingUsers}
            username={username}
          />
        </div>

        {/* Feed com posts bloqueados - scrollável */}
        <div className="bg-black">
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
        <nav className="fixed bottom-0 left-0 right-0 z-10 flex items-center justify-around border-t border-white/10 bg-black px-4 py-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-white"
          >
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
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
            className="text-white"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
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
            className="text-white"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <Image
            src="https://www.deepgram.online/home%20-%20feed/icones/reels.svg"
            alt="Reels"
            width={24}
            height={24}
            className="cursor-pointer"
          />
          <div className="h-6 w-6 rounded-full border border-white/20">
            <Image
              src={profile.profilePicUrl}
              alt={maskedProfileName}
              width={24}
              height={24}
              className="h-full w-full rounded-full object-cover"
            />
          </div>
        </nav>
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

