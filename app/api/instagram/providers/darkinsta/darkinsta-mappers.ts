import type { InstagramProfile, FollowingUser } from "../../instagram-scraper";
import type { DarkInstaUser, DarkInstaFollowingUser } from "./darkinsta-schemas";

const DEFAULT_PROFILE_PIC =
  "https://static.cdninstagram.com/rsrc.php/v3/y-/r/yCE2ef5JhSq.png";

export function mapDarkInstaUserToProfile(user: DarkInstaUser): InstagramProfile {
  return {
    id: user.id || user.pk || "",
    username: user.username,
    fullName: user.full_name || user.username,
    biography: user.biography || "",
    profilePicUrl:
      user.hd_profile_pic_url_info?.url ||
      user.profile_pic_url ||
      DEFAULT_PROFILE_PIC,
    followerCount: user.follower_count ?? null,
    followingCount: user.following_count ?? null,
    postCount: user.media_count ?? null,
    isPrivate: Boolean(user.is_private),
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function mapDarkInstaFollowingToUsers(
  users: DarkInstaFollowingUser[],
  sampleSize: number = 10,
): FollowingUser[] {
  const mapped = users
    .map((user) => ({
      id: user.id || user.pk || "",
      username: user.username || "",
      fullName: user.full_name || user.username || "",
      profilePicUrl: user.profile_pic_url || DEFAULT_PROFILE_PIC,
      isPrivate: Boolean(user.is_private),
      isVerified: Boolean(user.is_verified),
    }))
    .filter((item) => Boolean(item.username));

  const sorted = mapped.sort((a, b) => {
    const hashA = hashString(a.username);
    const hashB = hashString(b.username);
    if (hashA === hashB) {
      return a.username.localeCompare(b.username);
    }
    return hashA - hashB;
  });

  return sorted.slice(0, sampleSize);
}



