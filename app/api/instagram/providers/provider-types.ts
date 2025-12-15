import type { InstagramProfile, FollowingUser } from "../instagram-scraper";

export interface InstagramProvider {
  getUserByUsername(username: string): Promise<InstagramProfile>;
  getFollowingSampleByUserId(userId: string): Promise<FollowingUser[]>;
}

