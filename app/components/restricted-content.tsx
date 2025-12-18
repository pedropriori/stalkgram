'use client';

interface RestrictedContentProps {
  onClick?: () => void;
}

export default function RestrictedContent({ onClick }: RestrictedContentProps) {
  return (
    <button
      className="flex justify-end mb-2 cursor-pointer focus:outline-none"
      onClick={onClick}
    >
      <div className="relative w-64 h-64 bg-[#121822] rounded-lg flex items-center justify-center overflow-hidden">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-pink-900/20"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          {/* Lock Icon */}
          <svg
            className="w-12 h-12 text-white/80"
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

          {/* Text */}
          <p className="text-white/90 font-medium text-center px-4">
            Conteúdo restrito
          </p>
        </div>
      </div>
    </button>
  );
}


