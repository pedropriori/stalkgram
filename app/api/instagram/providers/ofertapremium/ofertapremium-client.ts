import axios, { AxiosInstance } from "axios";
import {
  OfertaPremiumProfileSchema,
  OfertaPremiumFollowingResponseSchema,
  type OfertaPremiumProfile,
  type OfertaPremiumFollowingResponse,
} from "./ofertapremium-schemas";

const DEFAULT_TIMEOUT = 15000;
const DEFAULT_BASE_URL = "https://ofertapremium.store";

export class OfertaPremiumClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.OFERTAPREMIUM_BASE_URL || DEFAULT_BASE_URL;

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        Accept: "application/json",
      },
      validateStatus: () => true,
    });
  }

  async getUserByUsername(username: string): Promise<OfertaPremiumProfile> {
    try {
      const response = await this.client.get("/api/get-user-by-username", {
        params: { username },
      });

      if (response.status !== 200) {
        throw new Error(
          `OfertaPremium retornou status ${response.status}: ${response.statusText}`,
        );
      }

      const parsed = OfertaPremiumProfileSchema.safeParse(response.data);

      if (!parsed.success) {
        throw new Error(
          `Resposta inválida da OfertaPremium: ${parsed.error.message}`,
        );
      }

      return parsed.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Erro ao buscar perfil na OfertaPremium: ${error.message}`,
        );
      }
      throw new Error("Erro desconhecido ao buscar perfil na OfertaPremium");
    }
  }

  async getFollowingByUserId(
    userId: string,
  ): Promise<OfertaPremiumFollowingResponse> {
    try {
      const response = await this.client.get("/api/get-following", {
        params: { user_id: userId },
      });

      if (response.status !== 200) {
        throw new Error(
          `OfertaPremium retornou status ${response.status}: ${response.statusText}`,
        );
      }

      // A resposta pode vir como array direto ou como objeto com propriedade users/following
      let data = response.data;
      if (Array.isArray(data)) {
        data = { users: data };
      }

      const parsed = OfertaPremiumFollowingResponseSchema.safeParse(data);

      if (!parsed.success) {
        throw new Error(
          `Resposta inválida da OfertaPremium (following): ${parsed.error.message}`,
        );
      }

      return parsed.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Erro ao buscar following na OfertaPremium: ${error.message}`,
        );
      }
      throw new Error("Erro desconhecido ao buscar following na OfertaPremium");
    }
  }
}

