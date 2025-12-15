'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function SetCompletionCookie() {
  const pathname = usePathname();
  
  useEffect(() => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      const username = parts[1];
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      document.cookie = `sg_allowed_username=${username}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    }
  }, [pathname]);

  return null;
}

