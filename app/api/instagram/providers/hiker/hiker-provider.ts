import type { InstagramProvider } from "../provider-types";
import type { InstagramProfile, FollowingUser } from "../../instagram-scraper";
import { HikerClient } from "./hiker-client";
import {
  mapHikerProfileToInstagramProfile,
  mapHikerFollowingToUsers,
} from "./hiker-mappers";

const SAMPLE_SIZE = 25; // Máximo de perfis disponíveis

export class HikerProvider implements InstagramProvider {
  private client: HikerClient;

  constructor(accessKey?: string, baseUrl?: string) {
    this.client = new HikerClient(accessKey, baseUrl);
  }

  async getUserByUsername(username: string): Promise<InstagramProfile> {
    const profile = await this.client.getUserByUsername(username);
    return mapHikerProfileToInstagramProfile(profile);
  }

  async getFollowingSampleByUserId(userId: string): Promise<FollowingUser[]> {
    const users = await this.client.getFollowingByUserId(userId);
    return mapHikerFollowingToUsers(users, SAMPLE_SIZE);
  }
}







