'use client';

import { useState, useEffect } from 'react';

export default function SaleTimer() {
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutos em segundos

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 rounded-b-2xl p-3 text-center shadow-lg">
      <p className="text-sm font-semibold text-white">
        Seu acesso foi limitado. Registre-se em: <span className="font-mono text-base">{formatTime(timeLeft)}</span>
      </p>
    </div>
  );
}

