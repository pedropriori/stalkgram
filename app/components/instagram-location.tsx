'use client';

import Image from "next/image";

interface InstagramLocationProps {
  profilePicUrl: string;
  username: string;
  onClick?: () => void;
  showBlur?: boolean;
  showLock?: boolean;
  showMaskedUsername?: boolean;
  renderAsDiv?: boolean;
}

function maskUsername(username: string): string {
  if (!username || username.length === 0) return "u*****";
  const firstChar = username.charAt(0).toLowerCase();
  return `${firstChar}*****`;
}

export default function InstagramLocation({
  profilePicUrl,
  username,
  onClick,
  showBlur = true,
  showLock = true,
  showMaskedUsername = true,
  renderAsDiv = false,
}: InstagramLocationProps) {
  const displayUsername = showMaskedUsername ? maskUsername(username) : `@${username}`;

  const containerProps: React.HTMLAttributes<HTMLDivElement | HTMLButtonElement> = {
    className: "text-left overflow-hidden rounded-2xl",
    style: { width: '280px', maxWidth: '90vw' },
    ...(onClick && !renderAsDiv ? { onClick } : {}),
  };

  const content = (
    <>
      {/* Top Section - Blurred Map with Avatar */}
      <div className="relative w-full h-36 overflow-hidden">
        {/* Blurred Map Background */}
        <Image
          src="/images/maps.png"
          alt="Mapa"
          width={280}
          height={144}
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
        />

        {/* Avatar Overlay - Centered */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg relative">
            {showBlur ? (
              <>
                {/* Blurred Avatar */}
                <div className="absolute inset-0 blur-sm">
                  <Image
                    src={profilePicUrl}
                    alt="Avatar"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Lock Icon Overlay - Centered */}
                {showLock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/40">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-80"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                )}
              </>
            ) : (
              <Image
                src={profilePicUrl}
                alt={username}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section - Text and Button */}
      <div
        className="px-4 py-3"
        style={{ background: 'rgb(31, 41, 55)' }}
      >
        <p className="font-semibold text-white text-sm mb-1">Localização atual</p>
        <p className="text-gray-400 text-xs mb-3">
          {displayUsername} está compartilhando
        </p>
        <div
          className="w-full py-2 rounded-lg font-semibold text-sm text-center"
          style={{
            background: 'rgb(37, 48, 64)',
            color: 'rgb(255, 255, 255)',
            border: 'none',
          }}
        >
          Ver
        </div>
      </div>
    </>
  );

  if (renderAsDiv) {
    return <div {...containerProps}>{content}</div>;
  }

  return <button {...containerProps}>{content}</button>;
}
