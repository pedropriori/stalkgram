"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AccessPopup from "./access-popup";
import ReelsIcon from "./icons/reels";

interface BottomNavigationProps {
  profilePicUrl: string;
  maskedProfileName: string;
  username: string;
}

export default function BottomNavigation({ profilePicUrl, maskedProfileName, username }: BottomNavigationProps) {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);

  const handleIconClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPopup(true);
  };

  const handleHomeClick = () => {
    router.push(`/perfil/${username}`);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-10 flex items-center justify-around border-t border-white/10 bg-[#0b1014] px-4 py-2">
        {/* Home Icon */}
        <button onClick={handleHomeClick} className="cursor-pointer">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-white"
          >
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        </button>

        {/* Search Icon */}
        <button onClick={handleIconClick} className="cursor-pointer">
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
        </button>

        {/* Add Icon */}
        <button onClick={handleIconClick} className="cursor-pointer">
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
        </button>

        {/* Reels Icon */}
        <button onClick={handleIconClick} className="cursor-pointer text-white">
          <ReelsIcon width={24} height={24} />
        </button>

        {/* Profile Icon */}
        <button onClick={handleIconClick} className="cursor-pointer">
          <div className="h-6 w-6 rounded-full border border-white/20">
            <Image
              src={profilePicUrl}
              alt={maskedProfileName}
              width={24}
              height={24}
              className="h-full w-full rounded-full object-cover"
            />
          </div>
        </button>
      </nav>
      {showPopup && <AccessPopup username={username} onClose={() => setShowPopup(false)} />}
    </>
  );
}

