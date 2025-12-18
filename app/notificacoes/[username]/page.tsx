import { getInstagramData } from "@/app/lib/instagram-data";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import ProfileHeader from "@/app/components/profile-header";
import BottomNavigation from "@/app/components/bottom-navigation";
import NotificacoesContent from "@/app/components/notificacoes-content";
import { hashString } from "@/app/lib/chat-templates";
import type { StoredFollowingUser } from "@/app/lib/following";
import {
  parseStoredFollowingCookie,
  selectMessageFollowingSample,
} from "@/app/lib/following";

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

function getDeterministicTime(seed: string): string {
  const times = ["11 h", "15 h", "1 d", "2 d", "3 d"];
  const hash = hashString(seed);
  return times[hash % times.length];
}

function getDeterministicStoryBorder(seed: string): boolean {
  const hash = hashString(seed);
  return (hash % 100) < 65;
}

function getDeterministicGreenBorder(seed: string): boolean {
  const hash = hashString(seed);
  return (hash % 100) < 30;
}

interface NotificationItem {
  id: string;
  users: Array<{
    username: string;
    profilePicUrl: string;
    hasStoryBorder: boolean;
    hasGreenBorder: boolean;
    isBlurred: boolean;
  }>;
  text: string;
  time: string;
  mediaUrl?: string;
  hasHeartIcon: boolean;
}

function generateFollowRequestNotification(
  users: StoredFollowingUser[],
  seed: string,
): NotificationItem | null {
  if (users.length === 0) return null;

  const hash = hashString(seed);
  const selectedUsers = users.slice(0, Math.min(2, users.length));
  const additionalCount = hash % 20;

  const notificationUsers = selectedUsers.map((user, idx) => {
    const userSeed = `${seed}-${user.username}-${idx}`;
    return {
      username: user.username,
      profilePicUrl: user.profilePicUrl,
      hasStoryBorder: false,
      hasGreenBorder: getDeterministicGreenBorder(userSeed),
      isBlurred: idx === 0 ? false : true,
    };
  });

  return {
    id: `follow-request-${seed}`,
    users: notificationUsers,
    text: `${maskUsername(selectedUsers[0].username)} + outras ${additionalCount} contas`,
    time: "",
    hasHeartIcon: false,
  };
}

function generateLikeNotification(
  users: StoredFollowingUser[],
  seed: string,
  type: "story" | "reel" | "post",
  repostedBy?: string,
): NotificationItem | null {
  if (users.length === 0) return null;

  const hash = hashString(seed);
  const userCount = (hash % 3) + 1;
  const selectedUsers = users.slice(0, Math.min(userCount + 1, users.length));
  const hasOthers = hash % 2 === 0;

  const notificationUsers = selectedUsers.map((user, idx) => {
    const userSeed = `${seed}-${user.username}-${idx}`;
    return {
      username: user.username,
      profilePicUrl: user.profilePicUrl,
      hasStoryBorder: getDeterministicStoryBorder(userSeed),
      hasGreenBorder: getDeterministicGreenBorder(userSeed),
      isBlurred: idx > 0,
    };
  });

  let text = "";
  if (selectedUsers.length === 1) {
    text = `${maskUsername(selectedUsers[0].username)} `;
  } else if (selectedUsers.length === 2) {
    text = `${maskUsername(selectedUsers[0].username)}, ${maskUsername(selectedUsers[1].username)} `;
  } else {
    text = `${maskUsername(selectedUsers[0].username)}, ${maskUsername(selectedUsers[1].username)} `;
  }

  if (type === "story") {
    text += hasOthers ? "e outras pessoas curtiram seu story." : "curtiram seu story.";
  } else if (type === "reel") {
    const reelOwner = users[(hash + 1) % users.length];
    text += `curtiram o reel de ${maskUsername(reelOwner.username)} que você repostou.`;
  } else {
    text += hasOthers ? "e outras pessoas curtiram seu post." : "curtiram seu post.";
  }

  const time = getDeterministicTime(`${seed}-time`);

  return {
    id: `like-${type}-${seed}`,
    users: notificationUsers,
    text,
    time,
    mediaUrl: "/midias/1x1/foto 1.png",
    hasHeartIcon: true,
  };
}

function generateSaveNotification(
  users: StoredFollowingUser[],
  seed: string,
): NotificationItem | null {
  if (users.length === 0) return null;

  const hash = hashString(seed);
  const userCount = (hash % 2) + 2;
  const selectedUsers = users.slice(0, Math.min(userCount, users.length));
  const hasOthers = hash % 2 === 0;

  const notificationUsers = selectedUsers.map((user, idx) => {
    const userSeed = `${seed}-${user.username}-${idx}`;
    return {
      username: user.username,
      profilePicUrl: user.profilePicUrl,
      hasStoryBorder: getDeterministicStoryBorder(userSeed),
      hasGreenBorder: false,
      isBlurred: idx > 0,
    };
  });

  let text = "";
  if (selectedUsers.length === 2) {
    text = `${maskUsername(selectedUsers[0].username)}, ${maskUsername(selectedUsers[1].username)} `;
  } else {
    text = `${maskUsername(selectedUsers[0].username)}, ${maskUsername(selectedUsers[1].username)} `;
  }
  text += hasOthers ? "e outras pessoas salvaram seu post." : "salvaram seu post.";

  return {
    id: `save-${seed}`,
    users: notificationUsers,
    text,
    time: getDeterministicTime(`${seed}-time`),
    mediaUrl: "/midias/1x1/foto 2.png",
    hasHeartIcon: false,
  };
}

function generateRepostNotification(
  users: StoredFollowingUser[],
  seed: string,
): NotificationItem | null {
  if (users.length === 0) return null;

  const hash = hashString(seed);
  const user = users[hash % users.length];
  const reelOwner = users[(hash + 1) % users.length];

  return {
    id: `repost-${seed}`,
    users: [
      {
        username: user.username,
        profilePicUrl: user.profilePicUrl,
        hasStoryBorder: false,
        hasGreenBorder: false,
        isBlurred: true,
      },
    ],
    text: `${maskUsername(user.username)} também repostou o reel de ${maskUsername(reelOwner.username)}.`,
    time: getDeterministicTime(`${seed}-time`),
    mediaUrl: "/midias/1x1/foto 8.png",
    hasHeartIcon: false,
  };
}

export default async function NotificacoesPage({
  params,
}: {
  params: PageParams | Promise<PageParams>;
}) {
  const resolved = await resolveParams(params);
  const username = resolved.username ?? "";

  if (!username) {
    return (
      <main className="min-h-screen bg-[#0b1014] text-white">
        <div className="mx-auto flex max-w-md flex-col">
          <div className="rounded-2xl border border-white/10 bg-rose-500/10 p-5 text-rose-100">
            <p className="text-lg font-semibold">Username não informado.</p>
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

  if (profile.username.toLowerCase() !== username.toLowerCase()) {
    return (
      <main className="min-h-screen bg-[#0b1014] text-white">
        <div className="mx-auto flex max-w-md flex-col">
          <div className="rounded-2xl border border-white/10 bg-rose-500/10 p-5 text-rose-100">
            <p className="text-lg font-semibold">Erro de validação</p>
          </div>
        </div>
      </main>
    );
  }

  if (profile.isPrivate && !hasFollowing) {
    redirect(`/vendas/${username}`);
  }

  const maskedProfileName = maskUsername(profile.username);

  // Obter perfis de followings
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const followingCookieName = `sg_dm_following_${username}`;
  const existingFollowingCookie = cookieStore.get(followingCookieName)?.value ?? "";

  let baseFollowingUsers: StoredFollowingUser[] = parseStoredFollowingCookie(existingFollowingCookie);

  if (baseFollowingUsers.length === 0 && hasFollowing) {
    baseFollowingUsers = selectMessageFollowingSample(data.followingSample);
  }

  // Gerar notificações
  const followRequest = generateFollowRequestNotification(
    baseFollowingUsers,
    `${username}-follow-request`,
  );

  const todayNotifications: NotificationItem[] = [];
  if (baseFollowingUsers.length > 0) {
    todayNotifications.push(
      generateLikeNotification(
        baseFollowingUsers,
        `${username}-today-1`,
        "reel",
      )!,
      generateLikeNotification(
        baseFollowingUsers,
        `${username}-today-2`,
        "story",
      )!,
    );
  }

  const last7DaysNotifications: NotificationItem[] = [];
  if (baseFollowingUsers.length > 0) {
    for (let i = 0; i < 8; i++) {
      const seed = `${username}-last7days-${i}`;
      const hash = hashString(seed);
      const type = hash % 4;

      let notification: NotificationItem | null = null;
      if (type === 0) {
        notification = generateLikeNotification(baseFollowingUsers, seed, "story");
      } else if (type === 1) {
        notification = generateLikeNotification(baseFollowingUsers, seed, "reel");
      } else if (type === 2) {
        notification = generateSaveNotification(baseFollowingUsers, seed);
      } else {
        notification = generateRepostNotification(baseFollowingUsers, seed);
      }

      if (notification) {
        last7DaysNotifications.push(notification);
      }
    }
  }

  return (
    <NotificacoesContent username={username}>
      <main className="min-h-screen bg-[#0b1014] text-white">
        <div className="mx-auto max-w-md bg-[#0b1014] pb-16">
          {/* Header */}
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0b1014] px-4 py-3">
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
            <span className="text-base font-semibold">{username}</span>
            <div className="w-6" />
          </header>

          <div className="pt-[70px] pb-[20px]">
            {/* Pedidos para seguir */}
            {followRequest && (
              <div className="mb-4">
                <h2 className="text-white font-semibold text-base px-4 pt-3 pb-2">
                  Pedidos para seguir
                </h2>
                <div className="space-y-0">
                  <button className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-900/30 transition-colors">
                    <div className="relative w-14 h-11 shrink-0">
                      <div className="relative">
                        {followRequest.users.map((user, idx) => (
                          <div
                            key={idx}
                            className={`absolute ${idx === 0
                              ? "left-0 top-0"
                              : "left-[18px] top-[12px]"
                              } w-11 h-11 rounded-full overflow-hidden`}
                          >
                            {user.hasGreenBorder ? (
                              <div
                                className="absolute inset-0 rounded-full p-[1.5px]"
                                style={{ background: "rgb(50, 181, 43)" }}
                              >
                                <div className="w-full h-full rounded-full bg-[#0B1014] p-[1.5px]">
                                  <div className="w-full h-full rounded-full overflow-hidden bg-[#0B1014]">
                                    <Image
                                      src={user.profilePicUrl}
                                      alt="Profile"
                                      width={44}
                                      height={44}
                                      className={`w-full h-full object-cover ${user.isBlurred ? "blur-[6px]" : ""
                                        }`}
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <Image
                                src={user.profilePicUrl}
                                alt="Profile"
                                width={44}
                                height={44}
                                className={`w-full h-full object-cover ${user.isBlurred ? "blur-[6px]" : ""
                                  }`}
                              />
                            )}
                          </div>
                        ))}
                        {followRequest.users.length > 0 && (
                          <div className="absolute top-6 right-0 left-6 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm leading-tight">
                        <span className="text-white font-semibold blur-[3px]">
                          {followRequest.text.split(" + ")[0]}
                        </span>{" "}
                        <span className="text-gray-400">
                          + {followRequest.text.split(" + ")[1]}
                        </span>
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Hoje */}
            {todayNotifications.length > 0 && (
              <div className="mb-4">
                <h2 className="text-white font-semibold text-base px-4 py-3">Hoje</h2>
                <div className="space-y-0">
                  {todayNotifications.map((notification) => (
                    <NotificationButton
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Últimos 7 dias */}
            {last7DaysNotifications.length > 0 && (
              <div className="mb-4">
                <h2 className="text-white font-semibold text-base px-4 py-3">
                  Últimos 7 dias
                </h2>
                <div className="space-y-0">
                  {last7DaysNotifications.map((notification) => (
                    <NotificationButton
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </div>
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
    </NotificacoesContent>
  );
}

function NotificationButton({ notification }: { notification: NotificationItem }) {
  const hasMultipleUsers = notification.users.length > 1;
  const containerWidth = hasMultipleUsers ? "w-16" : "w-14";

  return (
    <button className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-900/30 transition-colors">
      <div className={`relative ${containerWidth} h-11 shrink-0`}>
        <div className="relative">
          {notification.users.map((user, idx) => {
            const isFirst = idx === 0;
            const isSecond = idx === 1;
            const leftPosition = isFirst ? "left-0" : "left-[18px]";
            const topPosition = isFirst ? "top-0" : "top-[12px]";

            return (
              <div
                key={idx}
                className={`absolute ${leftPosition} ${topPosition} w-11 h-11 rounded-full overflow-hidden`}
              >
                {user.hasStoryBorder ? (
                  <div
                    className="absolute inset-0 rounded-full p-[1.5px]"
                    style={{
                      background:
                        "linear-gradient(135deg, rgb(235, 28, 143) 0%, rgb(223, 179, 19) 100%)",
                    }}
                  >
                    <div className="w-full h-full rounded-full bg-[#0B1014] p-[1.5px]">
                      <div className="w-full h-full rounded-full overflow-hidden">
                        <Image
                          src={user.profilePicUrl}
                          alt="Profile"
                          width={44}
                          height={44}
                          className={`w-full h-full object-cover ${user.isBlurred ? "blur-[6px]" : ""
                            }`}
                        />
                      </div>
                    </div>
                  </div>
                ) : user.hasGreenBorder ? (
                  <div
                    className="absolute inset-0 rounded-full p-[1.5px]"
                    style={{ background: "rgb(50, 181, 43)" }}
                  >
                    <div className="w-full h-full rounded-full bg-[#0B1014] p-[1.5px]">
                      <div className="w-full h-full rounded-full overflow-hidden">
                        <Image
                          src={user.profilePicUrl}
                          alt="Profile"
                          width={44}
                          height={44}
                          className={`w-full h-full object-cover ${user.isBlurred ? "blur-[6px]" : ""
                            }`}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={user.profilePicUrl}
                    alt="Profile"
                    width={44}
                    height={44}
                    className={`w-full h-full object-cover ${user.isBlurred ? "blur-[6px]" : ""
                      }`}
                  />
                )}
              </div>
            );
          })}
          {notification.hasHeartIcon && (
            <div className="absolute top-9 right-[-4px] w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-[#0B1014]">
              <svg
                className="w-3.5 h-3.5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm leading-tight text-white">
          {notification.text.split(/(\s+)/).map((part, idx) => {
            if (part.trim() === "") return <span key={idx}>{part}</span>;
            if (part.includes("curtiram") || part.includes("salvaram") || part.includes("repostou") || part.includes("também") || part.includes("que você") || part.includes("de") || part.includes("seu") || part.includes("story") || part.includes("post") || part.includes("reel") || part.includes("e outras pessoas")) {
              return <span key={idx} className="text-gray-400">{part}</span>;
            }
            if (part.match(/^\d+\s*[hd]$/)) {
              return <span key={idx} className="text-gray-500">{part}</span>;
            }
            if (part.includes("_") || part.match(/^[a-z]\*\*\*\*\*$/i)) {
              return <span key={idx} className="text-white font-semibold blur-[3px]">{part}</span>;
            }
            return <span key={idx}>{part}</span>;
          })}
          {notification.time && (
            <>
              {" "}
              <span className="text-gray-500">{notification.time}</span>
            </>
          )}
        </p>
      </div>
      {notification.mediaUrl && (
        <div className="relative w-12 h-12 shrink-0 rounded overflow-hidden">
          <div className="absolute inset-0 overflow-hidden rounded">
            <Image
              src={notification.mediaUrl}
              alt="Media"
              width={48}
              height={48}
              className="w-full h-full object-cover blur-[6px]"
              style={{ transform: "scale(1.1)" }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>
      )}
    </button>
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


