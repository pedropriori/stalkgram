import type { InstagramProvider } from "../provider-types";
import type { InstagramProfile, FollowingUser } from "../../instagram-scraper";
import { DarkInstaClient } from "./darkinsta-client";
import {
  mapDarkInstaUserToProfile,
  mapDarkInstaFollowingToUsers,
} from "./darkinsta-mappers";

const SAMPLE_SIZE = 25; // Máximo de perfis disponíveis

export class DarkInstaProvider implements InstagramProvider {
  private client: DarkInstaClient;

  constructor(baseUrl?: string) {
    this.client = new DarkInstaClient(baseUrl);
  }

  async getUserByUsername(username: string): Promise<InstagramProfile> {
    const response = await this.client.getUserByUsername(username);

    if ("error" in response) {
      throw new Error(response.error || "DarkInsta retornou erro");
    }

    if (!response.user) {
      throw new Error("DarkInsta retornou user null");
    }

    return mapDarkInstaUserToProfile(response.user);
  }

  async getFollowingSampleByUserId(userId: string): Promise<FollowingUser[]> {
    const response = await this.client.getFollowingByUserId(userId);
    return mapDarkInstaFollowingToUsers(response.response.users, SAMPLE_SIZE);
  }
}





