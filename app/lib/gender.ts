/**
 * Lê o gênero armazenado no cookie para um determinado username (client-side)
 * @param username - O username do perfil
 * @returns O gênero selecionado ('masculino' | 'feminino') ou null se não encontrado
 */
export function getGenderFromCookie(username: string): "masculino" | "feminino" | null {
  if (typeof document === "undefined") return null;
  
  const cookies = document.cookie.split(";");
  const cookieName = `sg_gender_${username}`;
  
  for (const cookie of cookies) {
    const trimmedCookie = cookie.trim();
    if (trimmedCookie.startsWith(`${cookieName}=`)) {
      const parts = trimmedCookie.split("=");
      if (parts.length >= 2 && parts[1]) {
        const gender = parts[1] as "masculino" | "feminino";
        if (gender === "masculino" || gender === "feminino") {
          return gender;
        }
      }
    }
  }
  
  return null;
}

/**
 * Lê o gênero armazenado no cookie para um determinado username (server-side)
 * @param cookieStore - Cookie store do Next.js (de cookies())
 * @param username - O username do perfil
 * @returns O gênero selecionado ('masculino' | 'feminino') ou null se não encontrado
 */
export function readGenderForUsername(
  cookieStore: { get: (name: string) => { value: string } | undefined },
  username: string,
): "masculino" | "feminino" | null {
  const cookieName = `sg_gender_${username}`;
  const cookie = cookieStore.get(cookieName);
  
  if (!cookie?.value) {
    return null;
  }
  
  const gender = cookie.value as "masculino" | "feminino";
  if (gender === "masculino" || gender === "feminino") {
    return gender;
  }
  
  return null;
}

/**
 * Lê o gênero temporário selecionado (antes de informar o username)
 * @returns O gênero selecionado ('masculino' | 'feminino') ou null se não encontrado
 */
export function getTemporaryGender(): "masculino" | "feminino" | null {
  if (typeof document === "undefined") return null;
  
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const trimmedCookie = cookie.trim();
    if (trimmedCookie.startsWith("sg_selected_gender=")) {
      const parts = trimmedCookie.split("=");
      if (parts.length >= 2 && parts[1]) {
        const gender = parts[1] as "masculino" | "feminino";
        if (gender === "masculino" || gender === "feminino") {
          return gender;
        }
      }
    }
  }
  return null;
}

/**
 * Define o cookie de gênero para um username
 * @param username - O username do perfil
 * @param gender - O gênero selecionado
 */
export function setGenderCookie(username: string, gender: "masculino" | "feminino"): void {
  if (typeof document === "undefined") return;
  // Formato simplificado: apenas o gênero, sem username no valor
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7); // 7 dias
  document.cookie = `sg_gender_${username}=${gender}; expires=${expiryDate.toUTCString()}; path=/; max-age=604800; SameSite=Lax`;
}

