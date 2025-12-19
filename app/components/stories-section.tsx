'use client';

import { useState } from 'react';
import Image from 'next/image';
import AccessPopup from './access-popup';

interface StoryUser {
  id: string;
  username: string;
  profilePicUrl: string;
  fullName: string;
}

interface StoriesSectionProps {
  profilePicUrl: string;
  profileName: string;
  followingUsers: StoryUser[];
  username: string;
}

function maskUsername(username: string): string {
  if (!username || username.length === 0) return "u*****";
  const firstChar = username.charAt(0).toLowerCase();
  return `${firstChar}*****`;
}

/**
 * Hash determinístico para gerar valores consistentes baseados em seed
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Determina se um perfil deve ter borda verde (melhores amigos)
 * Aproximadamente 30-40% dos perfis terão borda verde
 */
function hasGreenBorder(userId: string, username: string): boolean {
  const seed = `${userId}_${username}_green_border`;
  const hash = hashString(seed);
  // 35% de chance de ter borda verde (entre 30-40%)
  return (hash % 100) < 35;
}

export default function StoriesSection({
  profilePicUrl,
  profileName,
  followingUsers,
  username,
}: StoriesSectionProps) {
  const [showPopup, setShowPopup] = useState(false);

  const handleStoryClick = () => {
    setShowPopup(true);
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide">
        {/* Story do perfil principal */}
        <div className="flex shrink-0 flex-col items-center gap-1">
          <div className="relative cursor-pointer" onClick={handleStoryClick}>
            <div className="h-16 w-16 rounded-full border-2 border-white/20 p-0.5">
              <Image
                src={profilePicUrl}
                alt={profileName}
                width={64}
                height={64}
                className="h-full w-full rounded-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-black bg-blue-500">
              <span className="text-xs">+</span>
            </div>
          </div>
          <p className="max-w-[70px] truncate text-xs text-white">Seu story</p>
        </div>

        {/* Stories dos seguidos - fotos sem blur */}
        {followingUsers.slice(0, 8).map((user, index) => {
          const hasStory = true;
          const isBestFriend = hasGreenBorder(user.id, user.username);
          
          return (
            <div key={user.id} className="flex shrink-0 flex-col items-center gap-1">
              <div className="relative cursor-pointer" onClick={handleStoryClick}>
                {hasStory ? (
                  <div
                    className={`story-blur-container h-16 w-16 rounded-full p-[2px] overflow-hidden ${
                      isBestFriend
                        ? "bg-gradient-to-tr from-green-400 via-green-500 to-green-600"
                        : "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500"
                    }`}
                  >
                    <div className="h-full w-full rounded-full bg-[#0b1014] p-0.5 relative overflow-hidden">
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
                ) : (
                  <div className="story-blur-container h-16 w-16 rounded-full border-2 border-white/20 p-0.5 relative overflow-hidden">
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
                )}
              </div>
              <p className="max-w-[70px] truncate text-xs text-white">
                {maskUsername(user.username)}
              </p>
            </div>
          );
        })}
      </div>
      {showPopup && <AccessPopup username={username} onClose={() => setShowPopup(false)} />}
    </>
  );
}

