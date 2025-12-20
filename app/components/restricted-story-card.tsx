'use client';

import Image from 'next/image';

interface RestrictedStoryCardProps {
  storyImage: string;
  profilePicUrl: string;
  username: string;
  postedDate: string;
}

export default function RestrictedStoryCard({
  storyImage,
  profilePicUrl,
  username,
  postedDate,
}: RestrictedStoryCardProps) {
  const handleClick = () => {
    const planosSection = document.getElementById('planos');
    if (planosSection) {
      planosSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      onClick={handleClick}
      className="shrink-0 w-[160px] aspect-[9/16] rounded-2xl flex flex-col items-center justify-center py-3 px-2 relative overflow-hidden bg-[#121822] cursor-pointer transition-transform hover:scale-105"
    >
      {/* Imagem de fundo borrada */}
      <Image
        alt={`Story ${username}`}
        src={storyImage}
        fill
        className="object-cover blur-[10px]"
        style={{
          transform: 'scale(1.1)',
        }}
      />

      {/* Overlay escuro */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Avatar e username no canto superior esquerdo */}
      <div className="absolute top-2 left-2 z-10">
        <div className="flex items-center gap-1.5">
          <div
            className="rounded-full p-[1.5px]"
            style={{
              background: 'linear-gradient(135deg, rgb(235, 28, 143) 0%, rgb(223, 179, 19) 100%)',
            }}
          >
            <Image
              alt={username}
              src={profilePicUrl}
              width={24}
              height={24}
              className="rounded-full object-cover"
            />
          </div>
          <span className="text-white text-[10px] font-semibold truncate max-w-[80px]">
            @{username}
          </span>
        </div>
      </div>

      {/* Conteúdo centralizado */}
      <div className="flex flex-col items-center gap-2 relative z-10">
        {/* Ícone de cadeado */}
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          className="w-10 h-10 text-white/90"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>

        {/* Texto "Conteúdo restrito" */}
        <p className="text-white/90 font-medium text-center text-xs px-2">
          Conteúdo restrito
        </p>

        {/* Data postada com blur */}
        <p className="text-white/70 text-[10px] text-center px-2">
          Postado dia <span className="blur-[4px]">{postedDate}</span>
        </p>
      </div>
    </div>
  );
}


