import { hashString } from "@/app/lib/chat-templates";
import type { FollowingUser } from "@/app/api/instagram/instagram-scraper";

export interface StoredFollowingUser {
  id: string;
  username: string;
  profilePicUrl: string;
}

const MESSAGE_SAMPLE_START_INDEX = 12;
const MESSAGE_SAMPLE_END_INDEX = 25;
// Usar todos os perfis disponíveis (25) ao invés de limitar a 15
const MESSAGE_SAMPLE_FALLBACK_COUNT = 25;

export function getProfilesWithRepetition(
  allProfiles: StoredFollowingUser[],
  count: number,
  seed: string,
): StoredFollowingUser[] {
  if (allProfiles.length === 0) return [];

  if (allProfiles.length >= count) {
    return allProfiles.slice(0, count);
  }

  const result: StoredFollowingUser[] = [];
  const hash = hashString(seed);
  let position = hash % allProfiles.length;

  for (let i = 0; i < count; i++) {
    result.push(allProfiles[position]);
    position = (position + (hash % 3) + 1) % allProfiles.length;
  }

  return result;
}

export function parseStoredFollowingCookie(rawValue: string | undefined): StoredFollowingUser[] {
  if (!rawValue) {
    return [];
  }

  try {
    return JSON.parse(decodeURIComponent(rawValue)) as StoredFollowingUser[];
  } catch {
    return [];
  }
}

export function selectMessageFollowingSample(
  followingSample: FollowingUser[],
  sliceStart = MESSAGE_SAMPLE_START_INDEX,
  sliceEnd = MESSAGE_SAMPLE_END_INDEX,
): StoredFollowingUser[] {
  if (followingSample.length === 0) {
    return [];
  }

  const sorted = [...followingSample].sort((a, b) => {
    const hashA = hashString(a.username);
    const hashB = hashString(b.username);
    if (hashA === hashB) {
      return a.username.localeCompare(b.username);
    }
    return hashA - hashB;
  });

  const preferredSlice = sorted.slice(sliceStart, sliceEnd);
  const chosenSource = preferredSlice.length > 0 ? preferredSlice : sorted;

  // Usar todos os perfis disponíveis até o limite, mas não menos que o necessário
  const maxCount = Math.min(MESSAGE_SAMPLE_FALLBACK_COUNT, chosenSource.length);
  return chosenSource.slice(0, maxCount).map((user) => ({
    id: String(user.id),
    username: user.username,
    profilePicUrl: user.profilePicUrl,
  }));
}



