'use client';

import { useState, useRef, useEffect, createContext, useContext } from 'react';
import AccessPopup from './access-popup';

interface FeedContextType {
  showPopup: () => void;
  canShowCommentPopup: boolean;
  setCanShowCommentPopup: (value: boolean) => void;
}

const FeedContext = createContext<FeedContextType | null>(null);

export function useFeedContext() {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error('useFeedContext must be used within FeedInteractions');
  }
  return context;
}

interface FeedInteractionsProps {
  children: React.ReactNode;
  username?: string;
}

export default function FeedInteractions({ children, username }: FeedInteractionsProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [canShowCommentPopup, setCanShowCommentPopup] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!feedRef.current) return;
      const scrollPosition = feedRef.current.scrollTop;
      const postsScrolled = Math.floor(scrollPosition / 500);
      if (postsScrolled >= 2) {
        setCanShowCommentPopup(true);
      }
    };

    const feedElement = feedRef.current;
    if (feedElement) {
      feedElement.addEventListener('scroll', handleScroll);
      return () => feedElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleShowPopup = () => {
    setShowPopup(true);
  };

  return (
    <FeedContext.Provider value={{ showPopup: handleShowPopup, canShowCommentPopup, setCanShowCommentPopup }}>
      <div ref={feedRef} className="feed-container">
        {children}
      </div>
      {showPopup && <AccessPopup username={username} onClose={() => setShowPopup(false)} />}
    </FeedContext.Provider>
  );
}

