'use client';

import Image from 'next/image';
import Link from 'next/link';
import HeartIcon from './icons/heart';
import SendIcon from './icons/send';

interface ProfileHeaderProps {
  username: string;
}

export default function ProfileHeader({ username }: ProfileHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0b1014] px-4 py-3">
      <Link href="/" className="flex items-center" suppressHydrationWarning>
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
        <Link href={`/notificacoes/${username}`} className="cursor-pointer relative text-white" suppressHydrationWarning>
          <HeartIcon width={24} height={24} className="cursor-pointer" />
          <span className="absolute -right-1 -top-1 flex h-2 w-2 items-center justify-center rounded-full bg-red-500"></span>
        </Link>
        <Link href={`/dm/${username}`} className="relative text-white" suppressHydrationWarning>
          <SendIcon width={24} height={24} className="cursor-pointer" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
            16
          </span>
        </Link>
      </div>
    </header>
  );
}

