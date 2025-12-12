'use client';

import { useEffect } from 'react';

export default function SetCompletionCookie() {
  useEffect(() => {
    // Setar cookie quando a página de vendas carregar
    // Cookie válido por 1 ano
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    document.cookie = `deepgram_completed=true; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
  }, []);

  return null;
}

