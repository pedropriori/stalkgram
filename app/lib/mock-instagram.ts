import type { InstagramScrapeResult, InstagramProfile, FollowingUser } from "@/app/api/instagram/instagram-scraper";

/**
 * Hash determinístico para gerar valores consistentes baseados em seed
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Arrays de imagens disponíveis
 */
const FEMALE_IMAGES = Array.from({ length: 21 }, (_, i) => `/female_profile/fem_${i + 1}.jpg`);
const MALE_IMAGES = Array.from({ length: 21 }, (_, i) => `/male_profile/male_${i + 1}.jpg`);

/**
 * Listas de nomes para gerar usernames realistas
 */
const FEMALE_NAMES = [
  "ana", "maria", "julia", "sofia", "lara", "beatriz", "isabella", "laura", "manuela", "valentina",
  "giovanna", "alice", "luiza", "helena", "lorena", "catarina", "olivia", "cecilia", "antonia", "rafaela"
];

const MALE_NAMES = [
  "lucas", "gabriel", "matheus", "rafael", "arthur", "enzo", "guilherme", "nicolas", "davi", "pedro",
  "bernardo", "henrique", "murilo", "felipe", "joao", "theo", "benjamin", "samuel", "lorenzo", "vinicius"
];

const SURNAMES = [
  "silva", "santos", "oliveira", "souza", "rodrigues", "ferreira", "alves", "pereira", "lima", "gomes",
  "costa", "ribeiro", "martins", "carvalho", "almeida", "lopes", "soares", "fernandes", "vieira", "barbosa"
];

/**
 * Gera um username determinístico baseado em seed
 */
function generateUsername(seed: string, isFemale: boolean): string {
  const hash = hashString(seed);
  const namePool = isFemale ? FEMALE_NAMES : MALE_NAMES;
  const name = namePool[hash % namePool.length];
  const surname = SURNAMES[(hash * 7) % SURNAMES.length];
  const number = (hash % 99) + 1;
  return `${name}.${surname}_${number.toString().padStart(2, "0")}`;
}

/**
 * Seleciona uma imagem determinística do pool
 */
function selectImage(seed: string, imagePool: string[]): string {
  const hash = hashString(seed);
  return imagePool[hash % imagePool.length];
}

/**
 * Gera um perfil mock baseado no username
 */
function generateMockProfile(username: string): InstagramProfile {
  const hash = hashString(username);
  const cleanUsername = username.replace("@", "").trim().toLowerCase();
  
  // Usar uma imagem aleatória mas determinística do pool masculino como padrão
  const defaultImage = selectImage(`${cleanUsername}_profile`, MALE_IMAGES);
  
  return {
    id: `mock_${hash}`,
    username: cleanUsername,
    fullName: cleanUsername.split("_")[0].replace(".", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    biography: "",
    profilePicUrl: defaultImage,
    followerCount: Math.floor((hash % 50000) + 100),
    followingCount: Math.floor((hash % 2000) + 50),
    postCount: Math.floor((hash % 500) + 10),
    isPrivate: (hash % 3) === 0, // ~33% privado
  };
}

/**
 * Gera um following mock
 */
function generateMockFollowing(
  index: number,
  seed: string,
  isFemale: boolean,
  targetGender: "masculino" | "feminino",
): FollowingUser {
  const followingSeed = `${seed}_following_${index}`;
  const username = generateUsername(followingSeed, isFemale);
  const hash = hashString(followingSeed);
  
  // Determinar se é verificado (~12% de chance)
  const isVerified = (hash % 100) < 12;
  
  // Selecionar imagem do pool apropriado
  const imagePool = isFemale ? FEMALE_IMAGES : MALE_IMAGES;
  const profilePicUrl = selectImage(followingSeed, imagePool);
  
  return {
    id: `mock_following_${hash}`,
    username: username.toLowerCase(),
    fullName: username.split("_")[0].replace(".", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    profilePicUrl,
    isPrivate: (hash % 4) === 0, // ~25% privado
    isVerified,
  };
}

/**
 * Constrói dados mock do Instagram baseado no gênero do alvo
 * @param username - Username do perfil alvo
 * @param targetGender - Gênero do perfil alvo ('masculino' | 'feminino')
 * @returns InstagramScrapeResult com perfil mock e followings mock
 */
export function buildMockInstagramData(
  username: string,
  targetGender: "masculino" | "feminino",
): InstagramScrapeResult {
  const seed = `${username}_${targetGender}`;
  
  // Gerar perfil mock
  const profile = generateMockProfile(username);
  
  // Determinar distribuição 80/20
  // Se alvo é masculino → 80% followings femininos, 20% masculinos
  // Se alvo é feminino → 80% followings masculinos, 20% femininos
  const totalFollowings = 25;
  const majorCount = Math.floor(totalFollowings * 0.8); // 20 perfis
  const minorCount = totalFollowings - majorCount; // 5 perfis
  
  const isMajorFemale = targetGender === "masculino";
  
  const followingSample: FollowingUser[] = [];
  
  // Gerar followings majoritários (80%)
  for (let i = 0; i < majorCount; i++) {
    followingSample.push(generateMockFollowing(i, seed, isMajorFemale, targetGender));
  }
  
  // Gerar followings minoritários (20%)
  for (let i = 0; i < minorCount; i++) {
    followingSample.push(generateMockFollowing(majorCount + i, seed, !isMajorFemale, targetGender));
  }
  
  return {
    profile,
    followingSample,
    status: "ok",
  };
}

