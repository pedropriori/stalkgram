'use client';

interface MediaMessageProps {
  type: 'photo' | 'video';
  onClick?: () => void;
}

export default function MediaMessage({ type, onClick }: MediaMessageProps) {
  const label = type === 'photo' ? 'Foto' : 'Vídeo';

  return (
    <button
      className="flex items-end flex-row space-x-2 cursor-pointer focus:outline-none"
      onClick={onClick}
    >
      {/* Play Icon + Label */}
      <div
        className="px-3 py-2 rounded-2xl flex items-center space-x-2"
        style={{ background: '#1F2937', color: 'white' }}
      >
        <svg
          width="10"
          height="15"
          viewBox="0 0 35 39"
          fill="white"
        >
          <path d="M0 5.54924V33.4508C0 37.2749 4.11828 39.6835 7.4513 37.8086L32.2527 23.8579C35.6509 21.9464 35.6509 17.0536 32.2527 15.1421L7.45131 1.19136C4.11829 -0.683463 0 1.72511 0 5.54924Z" />
        </svg>
        <span className="text-sm font-medium text-white">{label}</span>
      </div>

      {/* Camera Icon Circle */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center"
        style={{ backgroundColor: '#1F2937' }}
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 66 64"
          fill="white"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M24.743 0.806959C22.974 1.01696 20.854 2.54296 18.826 5.06696C16.383 8.10696 14.966 9.00096 12.583 9.00396C10.887 9.00596 8.01 9.91596 6.19 11.026C0.838 14.289 0 17.748 0 36.582C0 51.783 0.187 53.561 2.159 57.069C5.68 63.333 8.651 64 33.052 64C55.815 64 58.402 63.529 63 58.551C65.45 55.898 65.506 55.477 65.811 37.491C66.071 22.148 65.858 18.626 64.513 16.024C62.544 12.217 57.524 9.00896 53.527 9.00396C51.336 9.00096 49.627 7.96696 47.027 5.07196C43.551 1.19996 43.384 1.13796 35.5 0.811961C31.1 0.629961 26.259 0.627959 24.743 0.806959ZM43.216 9.57496C44.622 12.66 48.789 15 52.878 15C54.903 15 56.518 15.843 57.927 17.635C59.831 20.055 60 21.594 60 36.524C60 59.297 62.313 57.5 33.052 57.5C3.655 57.5 6 59.35 6 36.204C6 20.562 6.122 19.499 8.174 17.314C9.469 15.936 11.511 15 13.224 15C17.15 15 21.289 12.696 22.954 9.58496C24.282 7.10396 24.693 6.99996 33.19 6.99996C41.731 6.99996 42.084 7.09096 43.216 9.57496ZM27 19.722C15.76 23.945 13.183 40.493 22.611 47.908C30.698 54.27 42.974 51.753 47.612 42.783C51.201 35.844 48.564 25.701 42.015 21.25C38.771 19.046 30.925 18.247 27 19.722ZM40.077 27.923C46.612 34.459 42.201 45.273 33 45.273C23.799 45.273 19.388 34.459 25.923 27.923C30.039 23.807 35.961 23.807 40.077 27.923Z"
          />
        </svg>
      </div>
    </button>
  );
}


