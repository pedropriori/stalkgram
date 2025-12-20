import type { InstagramProvider } from "../provider-types";
import type { InstagramProfile, FollowingUser } from "../../instagram-scraper";
import { OfertaPremiumClient } from "./ofertapremium-client";
import {
  mapOfertaPremiumProfileToInstagramProfile,
  mapOfertaPremiumFollowingToUsers,
} from "./ofertapremium-mappers";

const SAMPLE_SIZE = 25; // Máximo de perfis disponíveis

export class OfertaPremiumProvider implements InstagramProvider {
  private client: OfertaPremiumClient;

  constructor(baseUrl?: string) {
    this.client = new OfertaPremiumClient(baseUrl);
  }

  async getUserByUsername(username: string): Promise<InstagramProfile> {
    const profile = await this.client.getUserByUsername(username);
    return mapOfertaPremiumProfileToInstagramProfile(profile);
  }

  async getFollowingSampleByUserId(userId: string): Promise<FollowingUser[]> {
    const response = await this.client.getFollowingByUserId(userId);
    const users = response.users || response.following || [];
    return mapOfertaPremiumFollowingToUsers(users, SAMPLE_SIZE);
  }
}

