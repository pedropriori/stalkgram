'use client';

interface InstagramTimestampProps {
  /**
   * Timestamp em milissegundos ou string de data ISO
   * Se não fornecido, será gerado um timestamp determinístico baseado no seed
   */
  timestamp?: number | string | Date;
  /**
   * Seed para gerar timestamp determinístico
   * Útil para manter consistência entre renderizações
   */
  seed?: string;
  /**
   * Classe CSS adicional
   */
  className?: string;
}

/**
 * Função para gerar um número determinístico baseado em uma string
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Gera um timestamp determinístico baseado em uma seed
 * Retorna um timestamp entre 1 hora atrás e 7 dias atrás
 */
function getDeterministicTimestamp(seed: string): Date {
  const hash = hashString(seed);
  const now = new Date();

  // Gerar um offset entre 1 hora e 7 dias atrás
  const hoursAgo = 1 + (hash % (7 * 24 - 1)); // Entre 1h e 167h (quase 7 dias)
  const minutesOffset = hash % 60; // Adicionar minutos aleatórios (0-59)

  const timestamp = new Date(now);
  timestamp.setHours(timestamp.getHours() - hoursAgo);
  timestamp.setMinutes(timestamp.getMinutes() - minutesOffset);

  return timestamp;
}

/**
 * Formata uma data no estilo do Instagram
 * - Hoje: "Hoje, HH:MM"
 * - Ontem: "Ontem, HH:MM"
 * - Esta semana: "Segunda", "Terça", etc. + ", HH:MM"
 * - Mais antigo: "DD/MM, HH:MM" ou "DD/MM/YYYY, HH:MM" se for de outro ano
 */
function formatInstagramTimestamp(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Formatar hora sempre no formato HH:MM
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const timeString = `${hours}:${minutes}`;

  // Verificar se é hoje
  if (messageDate.getTime() === today.getTime()) {
    return `Hoje, ${timeString}`;
  }

  // Verificar se é ontem
  if (messageDate.getTime() === yesterday.getTime()) {
    return `Ontem, ${timeString}`;
  }

  // Verificar se é desta semana (últimos 7 dias)
  const daysDiff = Math.floor((today.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff <= 7) {
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const dayName = dayNames[date.getDay()];
    return `${dayName}, ${timeString}`;
  }

  // Para datas mais antigas, mostrar DD/MM ou DD/MM/YYYY se for de outro ano
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');

  if (date.getFullYear() !== now.getFullYear()) {
    return `${day}/${month}/${date.getFullYear()}, ${timeString}`;
  }

  return `${day}/${month}, ${timeString}`;
}

/**
 * Componente que exibe timestamp no formato do Instagram
 * Simula a exibição de data e horário como aparece nos chats do Instagram
 * Com metade do texto borrado e apenas a vírgula e os minutos visíveis
 */
export default function InstagramTimestamp({
  timestamp,
  seed,
  className = '',
}: InstagramTimestampProps) {
  let date: Date;

  if (timestamp) {
    // Se timestamp foi fornecido, usar diretamente
    date = typeof timestamp === 'string'
      ? new Date(timestamp)
      : timestamp instanceof Date
        ? timestamp
        : new Date(timestamp);
  } else if (seed) {
    // Se seed foi fornecido, gerar timestamp determinístico
    date = getDeterministicTimestamp(seed);
  } else {
    // Fallback: usar data atual menos algumas horas
    date = new Date();
    date.setHours(date.getHours() - 2);
  }

  const formatted = formatInstagramTimestamp(date);

  return (
    <span className={`text-xs text-white/60 ${className}`}>
      {formatted}
    </span>
  );
}



