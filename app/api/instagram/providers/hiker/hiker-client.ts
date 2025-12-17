import axios, { AxiosInstance } from "axios";
import {
  HikerProfileSchema,
  HikerFollowingResponseSchema,
  type HikerProfile,
  type HikerFollowingResponse,
} from "./hiker-schemas";

const DEFAULT_TIMEOUT = 15000;
const DEFAULT_BASE_URL = "https://api.hikerapi.com";

export class HikerClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private accessKey: string;

  constructor(accessKey?: string, baseUrl?: string) {
    this.accessKey =
      accessKey || process.env.HIKER_API_ACCESS_KEY || "";
    this.baseUrl = baseUrl || process.env.HIKER_BASE_URL || DEFAULT_BASE_URL;

    if (!this.accessKey) {
      throw new Error(
        "HIKER_API_ACCESS_KEY é obrigatória. Configure a variável de ambiente.",
      );
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        "x-access-key": this.accessKey,
        Accept: "application/json",
      },
      validateStatus: () => true,
    });
  }

  async getUserByUsername(username: string): Promise<HikerProfile> {
    try {
      const response = await this.client.get("/v1/user/by/username", {
        params: { username },
      });

      if (response.status !== 200) {
        throw new Error(
          `HikerAPI retornou status ${response.status}: ${response.statusText}`,
        );
      }

      const parsed = HikerProfileSchema.safeParse(response.data);

      if (!parsed.success) {
        throw new Error(
          `Resposta inválida da HikerAPI: ${parsed.error.message}`,
        );
      }

      return parsed.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erro ao buscar perfil na HikerAPI: ${error.message}`);
      }
      throw new Error("Erro desconhecido ao buscar perfil na HikerAPI");
    }
  }

  async getFollowingByUserId(userId: string): Promise<HikerFollowingResponse> {
    try {
      const response = await this.client.get("/v1/user/search/following", {
        params: { user_id: userId },
      });

      if (response.status !== 200) {
        throw new Error(
          `HikerAPI retornou status ${response.status}: ${response.statusText}`,
        );
      }

      const parsed = HikerFollowingResponseSchema.safeParse(response.data);

      if (!parsed.success) {
        throw new Error(
          `Resposta inválida da HikerAPI (following): ${parsed.error.message}`,
        );
      }

      return parsed.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erro ao buscar following na HikerAPI: ${error.message}`);
      }
      throw new Error("Erro desconhecido ao buscar following na HikerAPI");
    }
  }
}







