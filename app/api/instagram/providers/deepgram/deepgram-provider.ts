import type { InstagramProvider } from "../provider-types";
import type { InstagramProfile, FollowingUser } from "../../instagram-scraper";
import { DeepgramClient } from "./deepgram-client";
import {
  mapDeepgramUserToProfile,
  mapDeepgramFollowingToUsers,
} from "./deepgram-mappers";

const SAMPLE_SIZE = 10;

export class DeepgramProvider implements InstagramProvider {
  private client: DeepgramClient;

  constructor(baseUrl?: string) {
    this.client = new DeepgramClient(baseUrl);
  }

  async getUserByUsername(username: string): Promise<InstagramProfile> {
    const response = await this.client.getUserByUsername(username);

    if ("error" in response) {
      throw new Error(response.error || "Deepgram retornou erro");
    }

    if (!response.user) {
      throw new Error("Deepgram retornou user null");
    }

    return mapDeepgramUserToProfile(response.user);
  }

  async getFollowingSampleByUserId(userId: string): Promise<FollowingUser[]> {
    const response = await this.client.getFollowingByUserId(userId);
    return mapDeepgramFollowingToUsers(response.response.users, SAMPLE_SIZE);
  }
}

