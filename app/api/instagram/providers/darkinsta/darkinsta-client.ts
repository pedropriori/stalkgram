import axios, { AxiosInstance } from "axios";
import {
  DarkInstaProfileResponseSchema,
  DarkInstaFollowingResponseSchema,
  type DarkInstaProfileResponse,
  type DarkInstaFollowingResponse,
} from "./darkinsta-schemas";

const DEFAULT_TIMEOUT = 15000;
const DEFAULT_BASE_URL = "https://www.darkinsta.online/api";

export class DarkInstaClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.DARKINSTA_BASE_URL || DEFAULT_BASE_URL;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        Accept: "application/json",
      },
      validateStatus: () => true,
    });
  }

  async getUserByUsername(username: string): Promise<DarkInstaProfileResponse> {
    try {
      const response = await this.client.get("/get-user-by-username", {
        params: { username },
      });

      if (response.status !== 200) {
        throw new Error(
          `DarkInsta API retornou status ${response.status}: ${response.statusText}`,
        );
      }

      const parsed = DarkInstaProfileResponseSchema.safeParse(response.data);

      if (!parsed.success) {
        throw new Error(
          `Resposta inválida do DarkInsta: ${parsed.error.message}`,
        );
      }

      return parsed.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erro ao buscar perfil no DarkInsta: ${error.message}`);
      }
      throw new Error("Erro desconhecido ao buscar perfil no DarkInsta");
    }
  }

  async getFollowingByUserId(userId: string): Promise<DarkInstaFollowingResponse> {
    try {
      const response = await this.client.get("/get-following", {
        params: { user_id: userId },
      });

      if (response.status !== 200) {
        throw new Error(
          `DarkInsta API retornou status ${response.status}: ${response.statusText}`,
        );
      }

      const parsed = DarkInstaFollowingResponseSchema.safeParse(response.data);

      if (!parsed.success) {
        throw new Error(
          `Resposta inválida do DarkInsta (following): ${parsed.error.message}`,
        );
      }

      return parsed.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erro ao buscar following no DarkInsta: ${error.message}`);
      }
      throw new Error("Erro desconhecido ao buscar following no DarkInsta");
    }
  }
}





