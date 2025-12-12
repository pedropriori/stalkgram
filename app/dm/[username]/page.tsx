import scrapeInstagram from "@/app/api/instagram/instagram-scraper";
import Image from "next/image";
import Link from "next/link";
import DMMessagesList from "@/app/components/dm-messages-list";

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

function getDeterministicTime(seed: string): string {
  const times = [
    "25 min",
    "8 h",
    "4 h",
    "12 min",
    "18 min",
    "46 min",
    "3 h",
    "1 h",
    "2 h",
    "5 h",
    "30 min",
    "1 d",
    "2 d"
  ];
  const hash = hashString(seed);
  return times[hash % times.length];
}

const messageOptions = [
  "Oi, você já chegou?",
  "eii, tá aí? 🔥",
  "preciso falar contigo parada séria",
  "lembra aquela dia lá em....",
  "4 novas mensagens",
  "que foto incrível!",
  "uau, que lugar lindo!",
  "arrasou demais!",
  "sempre com as melhores fotos!",
  "que energia boa!",
];

function getDeterministicMessage(seed: string): string {
  const hash = hashString(seed);
  return messageOptions[hash % messageOptions.length];
}

const noteOptions = [
  "Oi, como você está?",
  "Bom dia!",
  "Tudo bem?",
  "Que dia lindo!",
  "Fazendo o quê?",
  "E aí?",
  "Tudo certo?",
  "Oi!",
  "Como foi seu dia?",
  "Tchau!",
];

function getDeterministicNote(seed: string): string {
  const hash = hashString(seed);
  return noteOptions[hash % noteOptions.length];
}

export default async function DMPage({ params }: { params: PageParams | Promise<PageParams> }) {
  const resolved = await resolveParams(params);
  const username = resolved.username ?? "";
  
  if (!username) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto flex max-w-md flex-col">
          <div className="rounded-2xl border border-white/10 bg-rose-500/10 p-5 text-rose-100">
            <p className="text-lg font-semibold">Username não informado.</p>
            <p className="mt-2 text-sm text-rose-50/90">Acesse via /dm/@usuario.</p>
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
  
  // Garantir que temos pelo menos um usuário antes de gerar mensagens
  if (followingUsers.length === 0) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto flex max-w-md flex-col">
          <div className="rounded-2xl border border-white/10 bg-rose-500/10 p-5 text-rose-100">
            <p className="text-lg font-semibold">Não foi possível carregar</p>
            <p className="mt-2 text-sm text-rose-50/90">Nenhum usuário seguido encontrado.</p>
          </div>
        </div>
      </main>
    );
  }
  
  // Gerar lista de mensagens com dados dos seguidos (determinístico)
  // Primeiras 5 mensagens fixas conforme a imagem
  const fixedMessages = [
    { message: "Oi, você já chegou?", time: "25 min", isLocked: false, isBlurred: false },
    { message: "eii, tá aí? 🔥", time: "8 h", isLocked: true, isBlurred: false },
    { message: "preciso falar contigo parada séria", time: "4 h", isLocked: true, isBlurred: false },
    { message: "lembra aquela dia lá em...", time: "12 min", isLocked: true, isBlurred: false },
    { message: "4 novas mensagens", time: "18 min", isLocked: true, isBlurred: false },
  ];

  const messages = followingUsers.slice(0, 8).map((user, index) => {
    // Primeiras 5 mensagens são fixas
    if (index < 5) {
      const fixedMsg = fixedMessages[index];
      
      const isLocked = fixedMsg.isLocked;
      const hasGradient = false;
      const hasOnlineIndicator = true;
      const isOrangeIndicator = false;
      const isBlurred = fixedMsg.isBlurred;
      const hasCameraDot = true;
      
      return {
        user,
        isLocked,
        hasGradient,
        hasOnlineIndicator,
        isOrangeIndicator,
        message: fixedMsg.message,
        isBlurred,
        hasCameraDot,
        time: fixedMsg.time,
      };
    }
    
    // Mensagens 6-8: geradas normalmente com mensagens borradas
    const isLocked = index >= 4;
    const hasGradient = index >= 5;
    const hasOnlineIndicator = true;
    const isOrangeIndicator = false;
    const isBlurred = index >= 3; // A partir do índice 3, mensagem borrada
    
    const messageSeed = `${username}-${user.username}-${index}-message`;
    const timeSeed = `${username}-${user.username}-${index}-time`;
    const message = getDeterministicMessage(messageSeed);
    const hasCameraDot = index !== 3 && index !== 6 && index !== 7;
    
    return {
      user,
      isLocked,
      hasGradient,
      hasOnlineIndicator,
      isOrangeIndicator,
      message,
      isBlurred,
      hasCameraDot,
      time: getDeterministicTime(timeSeed),
    };
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-md bg-black pb-16">
        {/* Header DM */}
        <header className="sticky top-0 z-10 border-b border-white/10 bg-black">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Link href={`/perfil/${username}`} className="flex items-center">
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
              <span className="text-base font-semibold">{profile.username}</span>
            </div>
            <div className="flex items-center gap-4">
              {/* Ícone de estrela com carinha */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 68 68"
                fill="white"
              >
                <path fillRule="evenodd" clipRule="evenodd" d="M30.8471 0.558896C27.5641 1.4949 25.7521 3.6039 19.6111 13.6319C17.4081 17.2299 15.3201 19.0549 10.7811 21.3459C7.51206 22.9959 3.92306 25.5089 2.80506 26.9299C-2.18494 33.2729 -0.395945 40.6819 7.20506 45.1619C16.6311 50.7169 18.1311 52.0689 21.3811 57.9379C25.9281 66.1469 28.6881 68.4199 34.1131 68.4199C39.7151 68.4199 43.4841 65.3589 47.7611 57.3319C50.5401 52.1179 51.8141 50.8849 58.1341 47.2889C65.8431 42.9029 68.6341 39.4949 68.6341 34.4659C68.6341 29.1849 66.2281 26.1259 58.4791 21.5519C51.9381 17.6909 50.6991 16.4519 47.1581 10.2269C42.1781 1.4739 37.4551 -1.3261 30.8471 0.558896ZM41.2421 12.4199C45.1841 19.3819 49.6631 23.8629 56.6341 27.8189C61.6411 30.6609 62.1341 31.2509 62.1341 34.4039C62.1341 37.6079 61.6531 38.1459 55.6941 41.6109C47.6871 46.2669 46.2451 47.7059 41.6841 55.5939C38.3161 61.4189 37.7551 61.9199 34.6011 61.9199C31.8761 61.9199 30.7941 61.3069 29.3111 58.9199C21.8511 46.9169 21.0491 46.0149 14.8281 42.6199C11.3601 40.7279 7.82105 38.1079 6.96305 36.7999C5.56105 34.6599 5.55806 34.1839 6.93406 32.0839C7.77606 30.7989 11.5491 27.9159 15.3181 25.6769C21.4241 22.0489 22.6481 20.7729 26.5451 13.9609C30.8301 6.4719 30.9931 6.3219 34.5231 6.6179C37.7361 6.8869 38.4661 7.5179 41.2421 12.4199ZM22.9431 26.0559C21.4701 29.8949 26.7831 32.7159 28.9671 29.2539C29.7301 28.0449 29.6571 27.1529 28.7041 26.0039C26.9931 23.9429 23.7431 23.9719 22.9431 26.0559ZM40.0181 25.8619C38.9531 28.6369 40.0901 30.9199 42.5391 30.9199C45.6931 30.9199 47.4801 28.1439 45.7041 26.0039C44.0621 24.0259 40.7541 23.9429 40.0181 25.8619ZM40.0651 37.4749C36.5741 39.7759 31.7631 39.9849 29.0751 37.9519C28.0081 37.1439 26.0901 36.4689 24.8141 36.4519C22.9831 36.4269 22.5621 36.8859 22.8141 38.6359C23.3121 42.0869 29.1181 45.4199 34.6341 45.4199C42.3761 45.4199 49.6601 39.1099 44.8751 36.5489C43.4611 35.7919 42.2691 36.0219 40.0651 37.4749Z" fill="#FFFFFF" />
              </svg>
              {/* Ícone de editar (caneta) */}
              <svg
                aria-label="Nova mensagem"
                fill="#FFFFFF"
                height="24"
                role="img"
                viewBox="0 0 24 24"
                width="24"
              >
                <title>Nova mensagem</title>
                <path d="M12.202 3.203H5.25a3 3 0 0 0-3 3V18.75a3 3 0 0 0 3 3h12.547a3 3 0 0 0 3-3v-6.952" fill="none" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                <path d="M10.002 17.226H6.774v-3.228L18.607 2.165a1.417 1.417 0 0 1 2.004 0l1.224 1.225a1.417 1.417 0 0 1 0 2.004Z" fill="none" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                <line fill="none" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="16.848" x2="20.076" y1="3.924" y2="7.153" />
              </svg>
            </div>
          </div>
          
          {/* Barra de busca */}
          <div className="px-4 pb-4">
            <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3.5">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white/60"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Pergunte à Meta AI ou pesquise"
                className="flex-1 bg-transparent text-base text-white placeholder:text-white/60 outline-none"
              />
            </div>
          </div>
        </header>

        {/* Stories Section */}
        <div className="border-b border-white/10 bg-black px-4 py-3">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide">
            {/* Nota "Conte as novidades" */}
            <div className="flex shrink-0 flex-col items-center gap-1">
              <div className="relative">
                <div className="mb-1 h-12 w-20 rounded-lg bg-gray-800/80 flex items-center justify-center px-2">
                  <p className="text-xs text-white text-center">
                    Conte as novidades
                  </p>
                </div>
                <div className="h-16 w-16 rounded-full border-2 border-white/20 p-0.5">
                  <Image
                    src={profile.profilePicUrl}
                    alt={profile.username}
                    width={64}
                    height={64}
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
              </div>
              <p className="max-w-[70px] truncate text-xs text-white">{profile.username}</p>
            </div>

            {/* Stories dos seguidos com notas */}
            {followingUsers.slice(0, 7).map((user, index) => {
              const noteSeed = `${username}-${user.id}-${index}-note`;
              const noteText = getDeterministicNote(noteSeed);
              const isWideNote = index >= 5; // Últimos 2 com nota mais larga
              return (
                <div key={user.id} className="flex shrink-0 flex-col items-center gap-1">
                  <div className="relative">
                    {/* Nota acima do perfil */}
                    <div className={`mb-1 ${isWideNote ? "h-10 w-24" : "h-12 w-20"} rounded-lg bg-gray-800/80 flex items-center justify-center px-2`}>
                      <p className="text-xs text-white blur-sm select-none text-center">
                        {noteText}
                      </p>
                    </div>
                    <div className="h-16 w-16 rounded-full overflow-hidden">
                      <Image
                        src={user.profilePicUrl}
                        alt={maskUsername(user.username)}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                  <p className="max-w-[70px] truncate text-xs text-white">
                    {maskUsername(user.username)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mensagens Section */}
        <div className="bg-black">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="text-base font-semibold text-white">Mensagens</span>
            <span className="text-sm text-blue-500">Pedidos (1)</span>
          </div>

          {/* Lista de mensagens */}
          <DMMessagesList
            messages={messages}
            username={username}
          />
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
              alt={profile.username}
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

