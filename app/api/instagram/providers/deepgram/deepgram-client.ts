import axios, { AxiosInstance } from "axios";
import {
  DeepgramProfileResponseSchema,
  DeepgramFollowingResponseSchema,
  type DeepgramProfileResponse,
  type DeepgramFollowingResponse,
} from "./deepgram-schemas";

const DEFAULT_TIMEOUT = 15000;
const DEFAULT_BASE_URL = "https://www.deepgram.online/api";

export class DeepgramClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.DEEPGRAM_BASE_URL || DEFAULT_BASE_URL;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        Accept: "application/json",
      },
      validateStatus: () => true,
    });
  }

  async getUserByUsername(username: string): Promise<DeepgramProfileResponse> {
    try {
      const response = await this.client.get("/get-user-by-username", {
        params: { username },
      });

      if (response.status !== 200) {
        throw new Error(
          `Deepgram API retornou status ${response.status}: ${response.statusText}`,
        );
      }

      const parsed = DeepgramProfileResponseSchema.safeParse(response.data);

      if (!parsed.success) {
        throw new Error(
          `Resposta inválida do Deepgram: ${parsed.error.message}`,
        );
      }

      return parsed.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erro ao buscar perfil no Deepgram: ${error.message}`);
      }
      throw new Error("Erro desconhecido ao buscar perfil no Deepgram");
    }
  }

  async getFollowingByUserId(userId: string): Promise<DeepgramFollowingResponse> {
    try {
      const response = await this.client.get("/get-following", {
        params: { user_id: userId },
      });

      if (response.status !== 200) {
        throw new Error(
          `Deepgram API retornou status ${response.status}: ${response.statusText}`,
        );
      }

      const parsed = DeepgramFollowingResponseSchema.safeParse(response.data);

      if (!parsed.success) {
        throw new Error(
          `Resposta inválida do Deepgram (following): ${parsed.error.message}`,
        );
      }

      return parsed.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erro ao buscar following no Deepgram: ${error.message}`);
      }
      throw new Error("Erro desconhecido ao buscar following no Deepgram");
    }
  }
}







