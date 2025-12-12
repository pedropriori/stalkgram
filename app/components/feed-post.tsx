'use client';

import { useState } from 'react';
import Image from 'next/image';
import AccessPopup from './access-popup';
import FeedActionButtons from './feed-action-buttons';

interface FeedPostProps {
  user: {
    id: string;
    username: string;
    fullName: string;
    profilePicUrl: string;
  };
  randomLikes: number;
  randomDate: string;
  randomComments: number;
  randomShares: number;
  randomComment: {
    text: string;
    emojis: string;
    textSize: string;
  };
  profileUsername: string;
}

function maskFullName(fullName: string | null | undefined, username: string): string {
  if (fullName && fullName.length > 0) {
    const firstChar = fullName.charAt(0).toLowerCase();
    return `${firstChar}*****`;
  }
  if (username && username.length > 0) {
    const firstChar = username.charAt(0).toLowerCase();
    return `${firstChar}*****`;
  }
  return "u*****";
}

export default function FeedPost({
  user,
  randomLikes,
  randomDate,
  randomComments,
  randomShares,
  randomComment,
  profileUsername,
}: FeedPostProps) {
  const [showPopup, setShowPopup] = useState(false);

  const handleImageClick = () => {
    setShowPopup(true);
  };

  const handleUnlockClick = () => {
    setShowPopup(true);
  };

  return (
    <>
      <div className="border-b border-white/10">
        {/* Header do post - foto pequena, nome mascarado, local oculto, três pontos */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full p-[1px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 overflow-hidden">
              <div className="h-full w-full rounded-full bg-black overflow-hidden">
                <div className="h-full w-full rounded-full overflow-hidden blur-[1px]">
                  <Image
                    src={user.profilePicUrl}
                    alt={user.username}
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {maskFullName(user.fullName, user.username)}
              </p>
              <p className="text-xs text-white/60">Local oculto</p>
            </div>
          </div>
          <button className="text-white">
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
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>
        </div>

        {/* Área com fundo cinza e cadeado - clicável */}
        <div className="relative min-h-[400px] w-full bg-gray-800 flex flex-col items-center justify-center gap-2">
          <div
            onClick={handleImageClick}
            className="flex flex-col items-center justify-center gap-2 cursor-pointer"
          >
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/60"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <p className="text-lg font-semibold text-white">Conteúdo restrito</p>
            <p className="text-sm text-white/60">
              {randomDate} - {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          {/* Botão Desbloquear */}
          <button
            onClick={handleUnlockClick}
            className="mt-2 px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition"
          >
            Desbloquear
          </button>
        </div>

        {/* Ações do post */}
        <div className="px-4 py-3">
          <FeedActionButtons randomComments={randomComments} randomShares={randomShares} />
        </div>

        {/* Curtidas e data */}
        <div className="px-4 pb-2">
          <p className="text-sm font-semibold text-white">{randomLikes} curtidas</p>
          <p className="mt-1 text-xs text-white/60">{randomDate}</p>
        </div>

        {/* Comentário do perfil principal */}
        <div className="px-4 pb-4">
          <div className="flex items-start gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">@{profileUsername}</span>
            <span className={`${randomComment.textSize} text-white blur-sm select-none`}>
              {randomComment.text}
            </span>
            <span className={randomComment.textSize}>{randomComment.emojis}</span>
          </div>
        </div>
      </div>
      {showPopup && <AccessPopup username={profileUsername} onClose={() => setShowPopup(false)} />}
    </>
  );
}

