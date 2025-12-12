'use client';

interface ScrollToPlansButtonProps {
  children: React.ReactNode;
  className?: string;
}

export default function ScrollToPlansButton({ children, className }: ScrollToPlansButtonProps) {
  const handleClick = () => {
    const planosSection = document.getElementById('planos');
    if (planosSection) {
      planosSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}

