'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AccessPopup from './access-popup';

interface ProfileHeaderProps {
  username: string;
}

export default function ProfileHeader({ username }: ProfileHeaderProps) {
  const [showPopup, setShowPopup] = useState(false);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPopup(true);
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-black px-4 py-3">
        <Link href="/" className="flex items-center">
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
        <Image
          src="/logo-insta.webp"
          alt="Instagram"
          width={103}
          height={28}
          className="h-7 w-auto"
          priority
        />
        <div className="flex items-center gap-4">
          <div onClick={handleHeartClick} className="cursor-pointer relative">
            <Image
              src="https://www.deepgram.online/home%20-%20feed/icones/coracao.svg"
              alt="Notificações"
              width={24}
              height={24}
              className="cursor-pointer"
            />
            <span className="absolute -right-1 -top-1 flex h-2 w-2 items-center justify-center rounded-full bg-red-500"></span>
          </div>
          <Link href={`/dm/${username}`} className="relative">
            <Image
              src="https://www.deepgram.online/home%20-%20feed/icones/enviar.svg"
              alt="Mensagens"
              width={24}
              height={24}
              className="cursor-pointer"
            />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
              16
            </span>
          </Link>
        </div>
      </header>
      {showPopup && <AccessPopup username={username} onClose={() => setShowPopup(false)} />}
    </>
  );
}

