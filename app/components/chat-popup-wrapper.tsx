'use client';

import { useState, useEffect } from 'react';
import AccessPopup from './access-popup';

interface ChatPopupWrapperProps {
  children: React.ReactNode;
  username?: string;
}

export default function ChatPopupWrapper({ children, username }: ChatPopupWrapperProps) {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Mostrar popup ao entrar no chat
    setShowPopup(true);
  }, []);

  return (
    <>
      {children}
      {showPopup && <AccessPopup username={username} onClose={() => setShowPopup(false)} />}
    </>
  );
}

