export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import scrapeInstagram from "./instagram-scraper";

interface RequestBody {
  username?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const username = body.username || "";
    const data = await scrapeInstagram(username);
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido ao processar.";
    const status = message.includes("obrigatórios") ? 500 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

