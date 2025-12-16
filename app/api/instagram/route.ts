export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getInstagramData } from "@/app/lib/instagram-data";
import { checkRateLimit } from "./rate-limiter";

interface RequestBody {
  username?: string;
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request);

  if (!rateLimit.allowed) {
    const resetIn = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      {
        error: `Muitas requisições. Tente novamente em ${resetIn} segundos.`,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": rateLimit.resetAt.toString(),
          "Retry-After": resetIn.toString(),
        },
      },
    );
  }

  try {
    const body = (await request.json()) as RequestBody;
    const username = body.username || "";
    const data = await getInstagramData(username);
    return NextResponse.json(data, {
      headers: {
        "X-RateLimit-Limit": "10",
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        "X-RateLimit-Reset": rateLimit.resetAt.toString(),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido ao processar.";
    const status = message.includes("obrigatórios") ? 500 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

