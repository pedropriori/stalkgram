'use client';

import { useFeedContext } from './feed-interactions';
import HeartFilledIcon from './icons/heart-filled';
import CommentIcon from './icons/comment';
import RepostIcon from './icons/repost';
import SendIcon from './icons/send';
import SaveIcon from './icons/save';

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
      <div className="cursor-pointer text-red-500" data-heart-button onClick={handleHeartClick}>
        <HeartFilledIcon width={24} height={24} />
      </div>
      <div className="flex items-center gap-1 text-white" data-comment-button onClick={handleCommentClick}>
        <CommentIcon width={24} height={24} className="cursor-pointer" />
        <span className="text-sm text-white">{randomComments}</span>
      </div>
      <div className="flex items-center gap-1 text-white">
        <RepostIcon width={24} height={24} className="cursor-pointer" />
        <span className="text-sm text-white">{randomShares}</span>
      </div>
      <div className="flex-1" />
      <div className="text-white">
        <SendIcon width={24} height={24} className="cursor-pointer" />
      </div>
      <div className="text-white">
        <SaveIcon width={24} height={24} className="cursor-pointer" />
      </div>
    </div>
  );
}

