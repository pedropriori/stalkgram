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

        {/* Stories dos seguidos - fotos desfocadas com cadeado */}
        {followingUsers.slice(0, 8).map((user, index) => {
          const hasStory = true;
          const isVisible = index < 2; // Apenas 2 primeiros sem cadeado
          return (
            <div key={user.id} className="flex shrink-0 flex-col items-center gap-1">
              <div className="relative cursor-pointer" onClick={handleStoryClick}>
                {hasStory ? (
                  <div className="story-blur-container h-16 w-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 overflow-hidden">
                    <div className="h-full w-full rounded-full bg-black p-0.5 relative overflow-hidden">
                      <div className={`h-full w-full rounded-full overflow-hidden ${!isVisible ? "blur-md" : ""}`}>
                        <Image
                          src={user.profilePicUrl}
                          alt={maskUsername(user.username)}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      {!isVisible && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-white/80"
                          >
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="story-blur-container h-16 w-16 rounded-full border-2 border-white/20 p-0.5 relative overflow-hidden">
                    <div className="h-full w-full rounded-full overflow-hidden blur-md">
                      <Image
                        src={user.profilePicUrl}
                        alt={maskUsername(user.username)}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white/80"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
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

