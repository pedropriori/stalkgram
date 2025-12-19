import { getInstagramDataOrMock } from "@/app/lib/instagram-data-fallback";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import DMMessagesList from "@/app/components/dm-messages-list";
import BottomNavigation from "@/app/components/bottom-navigation";
import SetDmFollowingCookie from "@/app/components/set-dm-following-cookie";
import type { StoredFollowingUser } from "@/app/lib/following";
import {
  getProfilesWithRepetition,
  parseStoredFollowingCookie,
  selectMessageFollowingSample,
} from "@/app/lib/following";
import { hashString } from "@/app/lib/chat-templates";
import {
  getAccessibleTemplateAssignments,
  getTemplatePreview,
} from "@/app/lib/chat-templates/accessible-helpers";

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
  "você tava com quem ontem?…",
  "não some assim não 😶",
  "vi você online e fingiu que não viu…",
  "depois me explica aquela curtida kkk",
  "promete que isso fica entre a gente?",
  "tô tentando não pensar nisso, sério…",
  "ok… mas você me deve uma explicação",
  "não faz isso comigo de novo…",
  "tô com saudade do seu jeito 😅",
  "a gente vai repetir ou vai fingir que não aconteceu?",
  "tô esperando você falar 'vem'…",
  "para de me provocar 😏",
  "você me deixa sem jeito…",
  "me manda uma foto vida",
  "eu gostei mais do que devia…",
  "se eu falar o que eu queria agora você…",
  "tô indo dormir… mas se você responder eu acordo",
  "me diz a verdade: você sente também?",
  "eu ainda lembro do que você falou quando…",
  "se alguém souber disso eu…",
  "eu não devia, mas eu queria…",
  "não acredito que você fez aquilo na frente de…",
  "a parte que eu mais gostei foi quando você…",
  "eii, tá aí? 🔥",
  "preciso falar contigo parada séria",
  "não acredito que você falou aquilo pra mim e pra ela igual…",
  "você sempre some quando tá com ela…",
  "não vai postar aquilo que combinamos né?",
];

function getDeterministicMessage(seed: string): string {
  const hash = hashString(seed);
  return messageOptions[hash % messageOptions.length];
}

const noteOptions = [
  "não conta pra ninguém…",
  "eu vi. tá? 👀",
  "alguém me explica isso…",
  "não era pra ter sido tão bom",
  "tô me segurando aqui",
  "tá… eu admito",
  "depois eu te falo",
  "me fez sorrir hoje",
  "ok… gostei",
  "não some.",
  "Oi, como você está?",
  "Bom dia!",
  "Tudo bem?",
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
      <main className="min-h-screen bg-[#0b1014] text-white">
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

  const maskedProfileName = maskFullName(profile.fullName, profile.username);

  const cookieStore = await cookies();
  const followingCookieName = `sg_dm_following_${username}`;
  const existingFollowingCookie = cookieStore.get(followingCookieName)?.value ?? "";

  let baseFollowingUsers: StoredFollowingUser[] = parseStoredFollowingCookie(existingFollowingCookie);

  if (baseFollowingUsers.length === 0 && hasFollowing) {
    baseFollowingUsers = selectMessageFollowingSample(data.followingSample);
  }

  // Com o novo sistema de fallback, sempre teremos followings (reais ou mock)
  // Se ainda assim não houver, usar os dados diretamente do followingSample
  if (baseFollowingUsers.length === 0 && data.followingSample.length > 0) {
    baseFollowingUsers = data.followingSample.slice(0, 25).map((user) => ({
      id: String(user.id),
      username: user.username,
      profilePicUrl: user.profilePicUrl,
    }));
  }

  // Separar perfis para stories (primeiros 12, com repetição determinística se necessário)
  const storiesProfiles = hasFollowing
    ? data.followingSample.slice(0, 12).map((user) => ({
      id: String(user.id),
      username: user.username,
      profilePicUrl: user.profilePicUrl,
    }))
    : [];

  const storiesFollowingUsers = getProfilesWithRepetition(
    storiesProfiles,
    7, // Para exibir nos stories
    `${username}-stories`,
  );

  // Converter storiesProfiles para StoredFollowingUser para usar nas mensagens se necessário
  const storiesAsStoredUsers: StoredFollowingUser[] = storiesProfiles.map((user) => ({
    id: user.id,
    username: user.username,
    profilePicUrl: user.profilePicUrl,
  }));

  type MessagePreview = {
    user: StoredFollowingUser;
    message: string;
    time: string;
    isBlurred: boolean;
    isLocked: boolean;
    hasGradient: boolean;
    hasOnlineIndicator: boolean;
    isOrangeIndicator: boolean;
    hasCameraDot: boolean;
    isAccessible?: boolean;
    hasStoryBorder?: boolean;
  };

function getDeterministicStoryBorder(seed: string): boolean {
  // Aproximadamente 65% dos perfis terão borda de story
  const hash = hashString(seed);
  return (hash % 100) < 65;
}

function getDeterministicGreenBorder(seed: string): boolean {
  // Aproximadamente 30-40% dos perfis terão borda verde (melhores amigos)
  const hash = hashString(seed);
  return (hash % 100) < 35;
}

  function getDeterministicOnlineIndicator(seed: string): boolean {
    // Aproximadamente 40% dos perfis terão indicador online
    const hash = hashString(seed);
    return (hash % 100) < 70;
  }

  function getDeterministicOrangeIndicator(seed: string): boolean {
    // Se tiver indicador online, 30% serão laranja (ocupado), 70% verde (online)
    const hash = hashString(seed);
    return (hash % 100) < 30;
  }

  const accessibleAssignments = getAccessibleTemplateAssignments(
    baseFollowingUsers,
    `${username}-accessible-chats`,
  );

  const accessibleMessages: MessagePreview[] = accessibleAssignments.map((assignment, idx) => {
    const messageSeed = `${username}-${assignment.user.username}-accessible-${idx}`;
    const storyBorderSeed = `${username}-${assignment.user.username}-story-border-${idx}`;
    const onlineIndicatorSeed = `${username}-${assignment.user.username}-online-${idx}`;
    const hasOnline = getDeterministicOnlineIndicator(onlineIndicatorSeed);
    return {
      user: assignment.user,
      message: getTemplatePreview(assignment.templateKey),
      time: getDeterministicTime(messageSeed),
      isBlurred: false,
      isLocked: false,
      hasGradient: false,
      hasOnlineIndicator: hasOnline,
      isOrangeIndicator: hasOnline ? getDeterministicOrangeIndicator(onlineIndicatorSeed) : false,
      hasCameraDot: false,
      isAccessible: true,
      hasStoryBorder: getDeterministicStoryBorder(storyBorderSeed),
    };
  });

  const accessibleUsernames = new Set(accessibleAssignments.map((assignment) => assignment.user.username));

  const remainingUsers = baseFollowingUsers.filter((user) => !accessibleUsernames.has(user.username));
  const generalCount = Math.max(0, 15 - accessibleMessages.length);

  // Usar apenas perfis únicos, sem repetições
  // Limitar ao número de perfis únicos disponíveis em remainingUsers
  // Se não houver remainingUsers suficientes, vamos completar depois com perfis dos stories
  const actualGeneralCount = Math.min(generalCount, remainingUsers.length);

  // Usar apenas os perfis restantes únicos, sem repetição
  const generalUsers = remainingUsers.slice(0, actualGeneralCount);

  const generalMessagesQueue: MessagePreview[] = generalUsers.map((user, idx) => {
    const messageSeed = `${username}-${user.username}-general-${idx}`;
    const timeSeed = `${username}-${user.username}-general-time-${idx}`;
    const storyBorderSeed = `${username}-${user.username}-story-border-general-${idx}`;
    const onlineIndicatorSeed = `${username}-${user.username}-online-general-${idx}`;
    const hasOnline = getDeterministicOnlineIndicator(onlineIndicatorSeed);
    return {
      user,
      message: getDeterministicMessage(messageSeed),
      time: getDeterministicTime(timeSeed),
      isBlurred: true,
      isLocked: true,
      hasGradient: true,
      hasOnlineIndicator: hasOnline,
      isOrangeIndicator: hasOnline ? getDeterministicOrangeIndicator(onlineIndicatorSeed) : false,
      hasCameraDot: true,
      isAccessible: false,
      hasStoryBorder: getDeterministicStoryBorder(storyBorderSeed),
    };
  });

  const finalMessages: MessagePreview[] = [];
  const usedUsernames = new Set<string>();

  // Primeiras 3 mensagens acessíveis
  accessibleMessages.slice(0, 3).forEach((msg) => {
    if (!usedUsernames.has(msg.user.username)) {
      finalMessages.push(msg);
      usedUsernames.add(msg.user.username);
    }
  });

  // Quarta mensagem borrada (mostrar outra conversa bloqueada)
  if (generalMessagesQueue.length > 0 && finalMessages.length < 15) {
    const nextMsg = generalMessagesQueue.shift()!;
    if (!usedUsernames.has(nextMsg.user.username)) {
      finalMessages.push(nextMsg);
      usedUsernames.add(nextMsg.user.username);
    }
  }

  // Quinta mensagem: outro chat acessível
  if (accessibleMessages[3] && finalMessages.length < 15) {
    if (!usedUsernames.has(accessibleMessages[3].user.username)) {
      finalMessages.push(accessibleMessages[3]);
      usedUsernames.add(accessibleMessages[3].user.username);
    }
  }

  // Demais mensagens (todas borradas) - apenas perfis únicos
  generalMessagesQueue.forEach((msg) => {
    if (finalMessages.length >= 15) return;
    if (!usedUsernames.has(msg.user.username)) {
      finalMessages.push(msg);
      usedUsernames.add(msg.user.username);
    }
  });

  // Se ainda não temos 15 mensagens, adicionar mais mensagens acessíveis restantes
  if (finalMessages.length < 15) {
    accessibleMessages.slice(4).forEach((msg) => {
      if (finalMessages.length < 15 && !usedUsernames.has(msg.user.username)) {
        finalMessages.push(msg);
        usedUsernames.add(msg.user.username);
      }
    });
  }

  // Se ainda não temos 15, usar perfis restantes de baseFollowingUsers que não foram usados
  if (finalMessages.length < 15) {
    const unusedUsers = baseFollowingUsers.filter((user) => !usedUsernames.has(user.username));
    unusedUsers.slice(0, 15 - finalMessages.length).forEach((user, idx) => {
      if (finalMessages.length < 15) {
        const messageSeed = `${username}-${user.username}-unused-${idx}`;
        const timeSeed = `${username}-${user.username}-unused-time-${idx}`;
        const storyBorderSeed = `${username}-${user.username}-story-border-unused-${idx}`;
        const onlineIndicatorSeed = `${username}-${user.username}-online-unused-${idx}`;
        const hasOnline = getDeterministicOnlineIndicator(onlineIndicatorSeed);

        finalMessages.push({
          user,
          message: getDeterministicMessage(messageSeed),
          time: getDeterministicTime(timeSeed),
          isBlurred: true,
          isLocked: true,
          hasGradient: true,
          hasOnlineIndicator: hasOnline,
          isOrangeIndicator: hasOnline ? getDeterministicOrangeIndicator(onlineIndicatorSeed) : false,
          hasCameraDot: true,
          isAccessible: false,
          hasStoryBorder: getDeterministicStoryBorder(storyBorderSeed),
        });
        usedUsernames.add(user.username);
      }
    });
  }

  // Se ainda não temos 15 mensagens, usar perfis dos stories que não foram usados
  // Isso garante que sempre teremos perfis únicos, sem repetições
  if (finalMessages.length < 15 && storiesAsStoredUsers.length > 0) {
    const unusedStoriesUsers = storiesAsStoredUsers.filter((user) => !usedUsernames.has(user.username));
    unusedStoriesUsers.slice(0, 15 - finalMessages.length).forEach((user, idx) => {
      if (finalMessages.length < 15) {
        const messageSeed = `${username}-${user.username}-stories-${idx}`;
        const timeSeed = `${username}-${user.username}-stories-time-${idx}`;
        const storyBorderSeed = `${username}-${user.username}-story-border-stories-${idx}`;
        const onlineIndicatorSeed = `${username}-${user.username}-online-stories-${idx}`;
        const hasOnline = getDeterministicOnlineIndicator(onlineIndicatorSeed);

        finalMessages.push({
          user,
          message: getDeterministicMessage(messageSeed),
          time: getDeterministicTime(timeSeed),
          isBlurred: true,
          isLocked: true,
          hasGradient: true,
          hasOnlineIndicator: hasOnline,
          isOrangeIndicator: hasOnline ? getDeterministicOrangeIndicator(onlineIndicatorSeed) : false,
          hasCameraDot: true,
          isAccessible: false,
          hasStoryBorder: getDeterministicStoryBorder(storyBorderSeed),
        });
        usedUsernames.add(user.username);
      }
    });
  }

  const messages = finalMessages.slice(0, 15);

  return (
    <main className="min-h-screen bg-[#0b1014] text-white">
      <SetDmFollowingCookie username={username} followingUsers={baseFollowingUsers} />
      <div className="mx-auto max-w-md bg-[#0b1014] pb-16">
        {/* Header DM */}
        <header className="sticky top-0 z-10 bg-[#0b1014]">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Link
                href={`/perfil/${username}`}
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
        <div className="bg-[#0b1014] px-4 py-3">
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

            {/* Stories dos seguidos com notas - usando perfis diferentes das mensagens */}
            {storiesFollowingUsers.slice(0, 7).map((user, index) => {
              const noteSeed = `${username}-${user.id}-${index}-note`;
              const noteText = getDeterministicNote(noteSeed);
              const isWideNote = index >= 5; // Últimos 2 com nota mais larga
              const greenBorderSeed = `${username}-${user.id}-${index}-green-border`;
              const hasGreenBorder = getDeterministicGreenBorder(greenBorderSeed);
              
              return (
                <div key={user.id} className="flex shrink-0 flex-col items-center gap-1">
                  <div className="relative">
                    {/* Nota acima do perfil */}
                    <div className={`mb-1 ${isWideNote ? "h-10 w-24" : "h-12 w-20"} rounded-lg bg-gray-800/80 flex items-center justify-center px-2`}>
                      <p className="text-xs text-white blur-sm select-none text-center">
                        {noteText}
                      </p>
                    </div>
                    <div
                      className={`h-16 w-16 rounded-full p-[2px] overflow-hidden ${
                        hasGreenBorder
                          ? "bg-gradient-to-tr from-green-400 via-green-500 to-green-600"
                          : "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500"
                      }`}
                    >
                      <div className="h-full w-full rounded-full bg-[#0b1014] p-0.5 overflow-hidden">
                        <div className="h-full w-full rounded-full overflow-hidden">
                          <Image
                            src={user.profilePicUrl}
                            alt={maskUsername(user.username)}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
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
        <div className="bg-[#0b1014]">
          <div className="flex items-center justify-between px-4 py-3">
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

