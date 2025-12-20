import axios, { AxiosInstance } from "axios";
import crypto from "crypto";
import https from "https";
import { OfertaPremiumProvider } from "./providers/ofertapremium/ofertapremium-provider";
import { HikerProvider } from "./providers/hiker/hiker-provider";
import {
  getCacheKey,
  getCached,
  setCached,
  getOrCreateInFlight,
} from "./cache/instagram-cache";

const INSTAGRAM_BASE_URL = "https://www.instagram.com";
const DEFAULT_FOLLOWING_LIMIT = 50;
const SAMPLE_SIZE = 25; // Máximo de perfis disponíveis
const ipv4Agent = new https.Agent({ family: 4 });

type ProviderMode = "auto" | "ofertapremium" | "hiker" | "legacy";

interface InstagramUserRaw {
  id: string;
  pk?: string;
  full_name?: string;
  username: string;
  biography?: string;
  profile_pic_url?: string;
  hd_profile_pic_url_info?: { url?: string };
  follower_count?: number;
  following_count?: number;
  media_count?: number;
  is_private?: boolean;
  edge_owner_to_timeline_media?: { count?: number };
}

interface FollowingUserRaw {
  pk?: string;
  id?: string;
  username?: string;
  full_name?: string;
  profile_pic_url?: string;
  is_private?: boolean;
  is_verified?: boolean;
  // fallback graphql fields
  profile_pic_url_hd?: string;
  edge_followed_by?: { count?: number };
  edge_follow?: { count?: number };
}

export interface FollowingUser {
  id: string;
  username: string;
  fullName: string;
  profilePicUrl: string;
  isPrivate: boolean;
  isVerified: boolean;
}

export interface InstagramProfile {
  id: string;
  username: string;
  fullName: string;
  biography: string;
  profilePicUrl: string;
  followerCount: number | null;
  followingCount: number | null;
  postCount: number | null;
  isPrivate: boolean;
}

export interface InstagramScrapeResult {
  profile: InstagramProfile;
  followingSample: FollowingUser[];
  status: "ok";
}

class InstagramEnvError extends Error {
  constructor() {
    super(
      "Env IG_SESSIONID e IG_CSRFTOKEN são obrigatórios para acessar os endpoints do Instagram.",
    );
  }
}

function buildHeaders(): Record<string, string> {
  const rawSessionId = process.env.IG_SESSIONID;
  const rawCsrfToken = process.env.IG_CSRFTOKEN;
  const sessionId = rawSessionId ? decodeURIComponent(rawSessionId) : "";
  const csrfToken = rawCsrfToken ? decodeURIComponent(rawCsrfToken) : "";
  if (!sessionId || !csrfToken) {
    throw new InstagramEnvError();
  }
  const dsUserId = sessionId.split(":")[0] || "";
  const userAgent =
    process.env.IG_USER_AGENT ||
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

  // Gerar identificadores únicos para parecer navegador real
  const igDid = crypto.randomUUID();
  const mid = crypto.randomBytes(16).toString("base64").replace(/[+/=]/g, "").slice(0, 26);

  return {
    "Accept": "*/*",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="131", "Google Chrome";v="131"',
    "Sec-Ch-Ua-Full-Version-List": '"Not_A Brand";v="8.0.0.0", "Chromium";v="131.0.6778.86", "Google Chrome";v="131.0.6778.86"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Model": '""',
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Sec-Ch-Ua-Platform-Version": '"15.0.0"',
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "User-Agent": userAgent,
    "X-Asbd-Id": "129477",
    "X-Csrftoken": csrfToken,
    "X-Ig-App-Id": "936619743392459",
    "X-Ig-Www-Claim": "0",
    "X-Requested-With": "XMLHttpRequest",
    "Cookie": `sessionid=${sessionId}; csrftoken=${csrfToken}; ds_user_id=${dsUserId}; ig_did=${igDid}; mid=${mid}; ig_nrcb=1`,
    "Referer": INSTAGRAM_BASE_URL,
    "Origin": INSTAGRAM_BASE_URL,
  };
}

function createHttpClient(headers: Record<string, string>): AxiosInstance {
  return axios.create({
    baseURL: INSTAGRAM_BASE_URL,
    headers,
    maxRedirects: 0,
    timeout: 15000,
    httpsAgent: ipv4Agent,
    validateStatus: () => true,
  });
}

function mapProfileFromUser(user: InstagramUserRaw): InstagramProfile {
  return {
    id: user.id || user.pk || "",
    username: user.username,
    fullName: user.full_name || user.username,
    biography: user.biography || "",
    profilePicUrl:
      user.hd_profile_pic_url_info?.url ||
      (user as FollowingUserRaw).profile_pic_url_hd ||
      user.profile_pic_url ||
      "https://static.cdninstagram.com/rsrc.php/v3/y-/r/yCE2ef5JhSq.png",
    followerCount:
      user.follower_count ??
      (user as FollowingUserRaw).edge_followed_by?.count ??
      null,
    followingCount:
      user.following_count ?? (user as FollowingUserRaw).edge_follow?.count ?? null,
    postCount:
      user.media_count ??
      user.edge_owner_to_timeline_media?.count ??
      null,
    isPrivate: Boolean(user.is_private),
  };
}

function sanitizeUsername(usernameInput: unknown): string {
  const username =
    typeof usernameInput === "string" ? usernameInput : String(usernameInput || "");
  const cleaned = username.replace("@", "").trim().toLowerCase();
  if (!cleaned) {
    throw new Error("Username inválido.");
  }
  return cleaned;
}

function shuffle<T>(items: T[], seed?: string): T[] {
  const cloned = [...items];
  if (!seed) {
    // Se não houver seed, usar shuffle aleatório (para compatibilidade)
    for (let i = cloned.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
    }
    return cloned;
  }

  // Shuffle determinístico baseado no seed
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  // Usar o hash como seed para um gerador pseudo-aleatório simples
  let seedValue = Math.abs(hash);
  function seededRandom() {
    seedValue = (seedValue * 9301 + 49297) % 233280;
    return seedValue / 233280;
  }

  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(seededRandom() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

async function fetchProfile(
  username: string,
  headers: Record<string, string>,
): Promise<InstagramProfile> {
  const client = createHttpClient(headers);
  const url = `/api/v1/users/web_profile_info/?username=${username}`;

  const response = await client.get(url);

  if (response.status === 401 || response.status === 403) {
    throw new Error("Sessão inválida ou expirada. Atualize IG_SESSIONID e IG_CSRFTOKEN.");
  }

  if (response.status === 429) {
    throw new Error("Muitas requisições. Por favor, aguarde alguns minutos e tente novamente.");
  }

  if (response.status === 404) {
    throw new Error("Perfil não encontrado. Verifique se o nome de usuário está correto.");
  }

  if (response.status !== 200) {
    // Tentar fallback
    return fallbackProfile(username, client);
  }

  const user: InstagramUserRaw | undefined = response.data?.data?.user;
  if (!user || !user.username) {
    return fallbackProfile(username, client);
  }

  return mapProfileFromUser(user);
}

async function fallbackProfile(
  username: string,
  client: AxiosInstance,
): Promise<InstagramProfile> {
  const url = `/${username}/?__a=1&__d=dis`;
  const response = await client.get(url);

  if (response.status !== 200) {
    throw new Error(`Falha ao buscar perfil (${response.status}).`);
  }

  const user: InstagramUserRaw | undefined =
    response.data?.graphql?.user || response.data?.user;

  if (!user || !user.username) {
    throw new Error("Perfil não encontrado ou estrutura de dados inesperada.");
  }

  return mapProfileFromUser(user);
}

async function fetchFollowing(
  userId: string,
  headers: Record<string, string>,
  seedUsername?: string,
): Promise<FollowingUser[]> {
  if (!userId) {
    return [];
  }
  const client = createHttpClient(headers);
  const url = `/api/v1/friendships/${userId}/following/?count=${DEFAULT_FOLLOWING_LIMIT}`;
  let users: FollowingUserRaw[] = [];
  try {
    const response = await client.get(url);
    if (response.status !== 200) {
      return [];
    }
    users = response.data?.users || [];
  } catch (error) {
    throw new Error(
      `Falha de rede ao buscar seguidores: ${(error as Error).message || "fetch failed"}`,
    );
  }
  const mapped = users.map((user) => ({
    id: user.id?.toString() || user.pk?.toString() || crypto.randomUUID(),
    username: user.username || "",
    fullName: user.full_name || user.username || "",
    profilePicUrl:
      user.profile_pic_url ||
      "https://static.cdninstagram.com/rsrc.php/v3/y-/r/yCE2ef5JhSq.png",
    isPrivate: Boolean(user.is_private),
    isVerified: Boolean(user.is_verified),
  }));
  const safe = mapped.filter((item) => Boolean(item.username));

  // Função hash determinística
  const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };

  // Ordenar de forma determinística baseado APENAS no hash do username do seguido
  // Usar apenas o username do seguido garante que a ordem seja sempre a mesma,
  // independente de quantas vezes a API seja chamada ou em que ordem retorne os dados
  // IMPORTANTE: Não usar seedUsername aqui para garantir que a ordem seja baseada apenas no username
  const sorted = safe.sort((a, b) => {
    // Ordenar apenas pelo hash do username do seguido
    // Isso garante que usuários com o mesmo username sempre apareçam na mesma posição
    const hashA = hashString(a.username);
    const hashB = hashString(b.username);
    // Se os hashes forem iguais, ordenar alfabeticamente como fallback
    if (hashA === hashB) {
      return a.username.localeCompare(b.username);
    }
    return hashA - hashB;
  });

  // Retornar apenas os primeiros SAMPLE_SIZE, já ordenados de forma determinística
  return sorted.slice(0, SAMPLE_SIZE);
}

function getProviderMode(): ProviderMode {
  const mode = (process.env.INSTAGRAM_PROVIDER || "auto").toLowerCase();
  if (["auto", "ofertapremium", "hiker", "legacy"].includes(mode)) {
    return mode as ProviderMode;
  }
  return "auto";
}

async function fetchProfileWithProviders(
  username: string,
  mode: ProviderMode,
): Promise<InstagramProfile> {
  if (mode === "hiker") {
    const hikerProvider = new HikerProvider();
    return hikerProvider.getUserByUsername(username);
  }

  if (mode === "legacy") {
    const headers = buildHeaders();
    return fetchProfile(username, headers);
  }

  try {
    const ofertapremiumProvider = new OfertaPremiumProvider();
    return await ofertapremiumProvider.getUserByUsername(username);
  } catch (error) {
    if (mode === "ofertapremium") {
      throw error;
    }

    try {
      const hikerProvider = new HikerProvider();
      return await hikerProvider.getUserByUsername(username);
    } catch (hikerError) {
      const headers = buildHeaders();
      return fetchProfile(username, headers);
    }
  }
}

async function fetchFollowingWithProviders(
  userId: string,
  mode: ProviderMode,
): Promise<FollowingUser[]> {
  if (!userId) {
    return [];
  }

  if (mode === "hiker") {
    const hikerProvider = new HikerProvider();
    return hikerProvider.getFollowingSampleByUserId(userId);
  }

  if (mode === "legacy") {
    const headers = buildHeaders();
    return fetchFollowing(userId, headers);
  }

  try {
    const ofertapremiumProvider = new OfertaPremiumProvider();
    return await ofertapremiumProvider.getFollowingSampleByUserId(userId);
  } catch (error) {
    if (mode === "ofertapremium") {
      return [];
    }

    try {
      const hikerProvider = new HikerProvider();
      return await hikerProvider.getFollowingSampleByUserId(userId);
    } catch (hikerError) {
      const headers = buildHeaders();
      return fetchFollowing(userId, headers);
    }
  }
}

export default async function scrapeInstagram(
  username: unknown,
): Promise<InstagramScrapeResult> {
  const cleanUsername = sanitizeUsername(username);
  const mode = getProviderMode();
  const cacheKey = getCacheKey(cleanUsername, mode);

  const cached = getCached(cacheKey);
  if (cached) {
    return cached;
  }

  return getOrCreateInFlight(cacheKey, async () => {
    try {
      const profile = await fetchProfileWithProviders(cleanUsername, mode);

      // Validação crítica: garantir que o username retornado corresponde ao solicitado
      // Isso previne problemas de cache misturado entre diferentes usernames
      const returnedUsername = profile.username.toLowerCase().trim();
      const requestedUsername = cleanUsername.toLowerCase().trim();

      if (returnedUsername !== requestedUsername) {
        const errorMsg = `Profile validation failed: requested '${requestedUsername}' but got '${returnedUsername}'`;
        throw new Error(errorMsg);
      }

      const followingSample = profile.isPrivate
        ? []
        : await fetchFollowingWithProviders(profile.id, mode);

      const result: InstagramScrapeResult = {
        profile,
        followingSample,
        status: "ok",
      };

      // Validar novamente antes de cachear
      if (result.profile.username.toLowerCase().trim() !== cleanUsername.toLowerCase().trim()) {
        throw new Error(`Final validation failed: username mismatch`);
      }

      setCached(cacheKey, result);
      return result;
    } catch (error) {
      // Não cachear erros - deixar propagar sem cachear
      throw error;
    }
  });
}


