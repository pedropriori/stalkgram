'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import AccessPopup from './access-popup';

interface FeedPost {
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
}

interface FeedWithPopupProps {
  posts: FeedPost[];
  profileUsername: string;
}

export default function FeedWithPopup({ posts, profileUsername }: FeedWithPopupProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [scrollCount, setScrollCount] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!feedRef.current) return;
      
      // Contar quantas fotos foram scrolladas (cada post tem aproximadamente 500px)
      const scrollPosition = feedRef.current.scrollTop;
      const postsScrolled = Math.floor(scrollPosition / 500);
      
      if (postsScrolled >= 2) {
        setScrollCount(2);
      }
    };

    const feedElement = feedRef.current;
    if (feedElement) {
      feedElement.addEventListener('scroll', handleScroll);
      return () => feedElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleHeartClick = () => {
    setShowPopup(true);
  };

  const handleCommentClick = () => {
    // Só mostra popup se já scrollou 2 fotos
    if (scrollCount >= 2) {
      setShowPopup(true);
    }
  };

  return (
    <>
      <div ref={feedRef} className="space-y-6 overflow-y-auto">
        {posts.map((post, index) => (
          <div key={post.user.id} className="bg-black">
            {/* Header do Post */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full overflow-hidden p-[1px] bg-gradient-to-br from-purple-500 to-orange-500">
                  <div className="h-full w-full rounded-full overflow-hidden bg-black blur-[1px]">
                    <Image
                      src={post.user.profilePicUrl}
                      alt={post.user.username}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {post.user.username.charAt(0).toLowerCase()}*****
                  </p>
                  <p className="text-xs text-white/60">Local oculto</p>
                </div>
              </div>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="cursor-pointer"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </div>

            {/* Conteúdo do Post */}
            <div className="bg-gray-800 h-96 flex items-center justify-center relative">
              <div className="text-center">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto mb-4"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <p className="text-white text-lg font-semibold">Conteúdo restrito</p>
                <p className="text-white/60 text-sm mt-2">{post.randomDate}</p>
              </div>
            </div>

            {/* Ações do Post */}
            <div className="px-4 py-3">
              <div className="flex items-center gap-4">
                <div onClick={handleHeartClick} className="cursor-pointer">
                  <Image
                    src="https://www.deepgram.online/home%20-%20feed/icones/coracao-curtido.svg"
                    alt="Curtir"
                    width={24}
                    height={24}
                    style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(7471%) hue-rotate(346deg) brightness(99%) contrast(118%)' }}
                  />
                </div>
                <div className="flex items-center gap-1" onClick={handleCommentClick}>
                  <Image
                    src="https://www.deepgram.online/home%20-%20feed/icones/comentario.svg"
                    alt="Comentar"
                    width={24}
                    height={24}
                    className="cursor-pointer"
                  />
                  <span className="text-sm text-white">{post.randomComments}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Image
                    src="https://www.deepgram.online/home%20-%20feed/icones/repost.svg"
                    alt="Repost"
                    width={24}
                    height={24}
                    className="cursor-pointer"
                  />
                  <span className="text-sm text-white">{post.randomShares}</span>
                </div>
                <div className="flex-1" />
                <Image
                  src="https://www.deepgram.online/home%20-%20feed/icones/enviar.svg"
                  alt="Enviar"
                  width={24}
                  height={24}
                  className="cursor-pointer"
                />
                <Image
                  src="https://www.deepgram.online/home%20-%20feed/icones/salvar.svg"
                  alt="Salvar"
                  width={24}
                  height={24}
                  className="cursor-pointer"
                />
              </div>
            </div>

            {/* Curtidas e data */}
            <div className="px-4 pb-2">
              <p className="text-sm font-semibold text-white">{post.randomLikes} curtidas</p>
              <p className="mt-1 text-xs text-white/60">{post.randomDate}</p>
            </div>

            {/* Comentário do perfil principal */}
            <div className="px-4 pb-4">
              <div className="flex items-start gap-2 flex-wrap">
                <span className="text-sm font-semibold text-white">@{profileUsername}</span>
                <span className={`${post.randomComment.textSize} text-white blur-sm select-none`}>
                  {post.randomComment.text}
                </span>
                <span className={post.randomComment.textSize}>{post.randomComment.emojis}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showPopup && <AccessPopup onClose={() => setShowPopup(false)} />}
    </>
  );
}

