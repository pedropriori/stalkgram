'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AccessPopup from './access-popup';

interface Message {
  user: {
    id: string;
    username: string;
    profilePicUrl: string;
  };
  message: string;
  time: string;
  isBlurred: boolean;
  isLocked: boolean;
  hasGradient: boolean;
  hasOnlineIndicator: boolean;
  isOrangeIndicator: boolean;
  hasCameraDot: boolean;
}

interface DMMessagesListProps {
  messages: Message[];
  username: string;
}

function maskUsername(username: string): string {
  if (!username || username.length === 0) return "u*****";
  const firstChar = username.charAt(0).toLowerCase();
  return `${firstChar}*****`;
}

export default function DMMessagesList({ messages, username }: DMMessagesListProps) {
  const [showPopup, setShowPopup] = useState(false);

  const handleMessageClick = (index: number) => {
    // Se não for o primeiro (índice 0), mostrar popup
    if (index !== 0) {
      setShowPopup(true);
    }
  };

  return (
    <>
      <div className="divide-y divide-white/10">
        {messages.map((msg, index) => {
          const isFirst = index === 0;
          const firstUserUsername = messages[0]?.user.username || "";
          const ChatWrapper = isFirst ? Link : 'div';
          const chatProps = isFirst ? { href: `/dm/${username}/chat/${firstUserUsername}` } : {};
          
          return (
            <ChatWrapper
              key={`msg-${msg.user.id}-${index}`}
              {...chatProps}
              onClick={() => handleMessageClick(index)}
              className={isFirst ? "flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition" : "flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition"}
            >
              <div className="relative shrink-0">
                {index < 4 ? (
                  <div className="h-12 w-12 rounded-full overflow-hidden">
                    <Image
                      src={msg.user.profilePicUrl}
                      alt={maskUsername(msg.user.username)}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className={`h-12 w-12 rounded-full overflow-hidden relative ${msg.hasGradient ? "p-[2px] bg-gradient-to-br from-purple-500 to-orange-500" : ""}`}>
                    <div className={`h-full w-full rounded-full overflow-hidden ${msg.hasGradient ? "bg-black" : ""}`}>
                      <div className="h-full w-full rounded-full overflow-hidden blur-md">
                        <Image
                          src={msg.user.profilePicUrl}
                          alt={maskUsername(msg.user.username)}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
                {msg.hasOnlineIndicator && (
                  <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 ${index < 4 ? "border-black" : "border-white"} ${msg.isOrangeIndicator ? "bg-orange-500" : "bg-green-500"}`} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-white">
                    {maskUsername(msg.user.username)}
                  </span>
                  <span className="text-xs text-white/60 shrink-0">{msg.time}</span>
                </div>
                <p className={`text-sm font-semibold text-white truncate ${msg.isBlurred ? "blur-sm select-none" : ""}`}>
                  {msg.isBlurred ? "Mensagem restrita" : msg.message}
                </p>
              </div>
              <div className="shrink-0 relative">
                {msg.hasCameraDot && (
                  <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-blue-500 border border-black z-10" />
                )}
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 64 64"
                  fill="white"
                  className="text-white/60"
                >
                  <path fillRule="evenodd" clipRule="evenodd" d="M24.743 0.806959C22.974 1.01696 20.854 2.54296 18.826 5.06696C16.383 8.10696 14.966 9.00096 12.583 9.00396C10.887 9.00596 8.01 9.91596 6.19 11.026C0.838 14.289 0 17.748 0 36.582C0 51.783 0.187 53.561 2.159 57.069C5.68 63.333 8.651 64 33.052 64C55.815 64 58.402 63.529 63 58.551C65.45 55.898 65.506 55.477 65.811 37.491C66.071 22.148 65.858 18.626 64.513 16.024C62.544 12.217 57.524 9.00896 53.527 9.00396C51.336 9.00096 49.627 7.96696 47.027 5.07196C43.551 1.19996 43.384 1.13796 35.5 0.811961C31.1 0.629961 26.259 0.627959 24.743 0.806959ZM43.216 9.57496C44.622 12.66 48.789 15 52.878 15C54.903 15 56.518 15.843 57.927 17.635C59.831 20.055 60 21.594 60 36.524C60 59.297 62.313 57.5 33.052 57.5C3.655 57.5 6 59.35 6 36.204C6 20.562 6.122 19.499 8.174 17.314C9.469 15.936 11.511 15 13.224 15C17.15 15 21.289 12.696 22.954 9.58496C24.282 7.10396 24.693 6.99996 33.19 6.99996C41.731 6.99996 42.084 7.09096 43.216 9.57496ZM27 19.722C15.76 23.945 13.183 40.493 22.611 47.908C30.698 54.27 42.974 51.753 47.612 42.783C51.201 35.844 48.564 25.701 42.015 21.25C38.771 19.046 30.925 18.247 27 19.722ZM40.077 27.923C46.612 34.459 42.201 45.273 33 45.273C23.799 45.273 19.388 34.459 25.923 27.923C30.039 23.807 35.961 23.807 40.077 27.923Z" fill="white" />
                </svg>
              </div>
            </ChatWrapper>
          );
        })}
      </div>
      {showPopup && <AccessPopup username={username} onClose={() => setShowPopup(false)} />}
    </>
  );
}

