import type { InstagramProfile, FollowingUser } from "../../instagram-scraper";
import type {
  OfertaPremiumProfile,
  OfertaPremiumFollowingUser,
} from "./ofertapremium-schemas";

const DEFAULT_PROFILE_PIC =
  "https://static.cdninstagram.com/rsrc.php/v3/y-/r/yCE2ef5JhSq.png";

export function mapOfertaPremiumProfileToInstagramProfile(
  profile: OfertaPremiumProfile,
): InstagramProfile {
  return {
    id: profile.id,
    username: profile.username,
    fullName: profile.full_name || profile.username,
    biography: profile.biography || "",
    profilePicUrl: profile.profile_pic_url || DEFAULT_PROFILE_PIC,
    followerCount: profile.follower_count ?? null,
    followingCount: profile.following_count ?? null,
    postCount: profile.post_count ?? profile.media_count ?? null,
    isPrivate: Boolean(profile.is_private),
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

export function mapOfertaPremiumFollowingToUsers(
  users: OfertaPremiumFollowingUser[],
  sampleSize: number = 10,
): FollowingUser[] {
  const mapped = users
    .map((user) => ({
      id: user.id,
      username: user.username,
      fullName: user.full_name || user.username,
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

