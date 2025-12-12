'use client';

import Image from 'next/image';
import { useFeedContext } from './feed-interactions';

interface FeedActionButtonsProps {
  randomComments: number;
  randomShares: number;
}

export default function FeedActionButtons({ randomComments, randomShares }: FeedActionButtonsProps) {
  const { showPopup, canShowCommentPopup } = useFeedContext();

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    showPopup();
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    if (canShowCommentPopup) {
      e.preventDefault();
      e.stopPropagation();
      showPopup();
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="cursor-pointer" data-heart-button onClick={handleHeartClick}>
        <Image
          src="https://www.deepgram.online/home%20-%20feed/icones/coracao-curtido.svg"
          alt="Curtir"
          width={24}
          height={24}
          style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(7471%) hue-rotate(346deg) brightness(99%) contrast(118%)' }}
        />
      </div>
      <div className="flex items-center gap-1" data-comment-button onClick={handleCommentClick}>
        <Image
          src="https://www.deepgram.online/home%20-%20feed/icones/comentario.svg"
          alt="Comentar"
          width={24}
          height={24}
          className="cursor-pointer"
        />
        <span className="text-sm text-white">{randomComments}</span>
      </div>
      <div className="flex items-center gap-1">
        <Image
          src="https://www.deepgram.online/home%20-%20feed/icones/repost.svg"
          alt="Repost"
          width={24}
          height={24}
          className="cursor-pointer"
        />
        <span className="text-sm text-white">{randomShares}</span>
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
  );
}

