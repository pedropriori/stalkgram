import Image from "next/image";
import Link from "next/link";
import MatrixBackground from "@/app/components/matrix-background";
import { getInstagramDataOrMock } from "@/app/lib/instagram-data-fallback";

interface PageParams {
  username?: string;
}

async function resolveParams(params: unknown): Promise<PageParams> {
  const resolved = await Promise.resolve(params as PageParams);
  return resolved || {};
}

async function getProfileData(username: string) {
  try {
    const result = await getInstagramDataOrMock(username);
    return { data: result.data, error: "", usedMock: result.usedMock };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao buscar dados do Instagram.";
    return { data: null, error: message, usedMock: false };
  }
}

export default async function ConfirmarPage({
  params,
}: {
  params: PageParams | Promise<PageParams>;
}) {
  const resolved = await resolveParams(params);
  const username = resolved.username ?? "";

  if (!username) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <MatrixBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
          <div className="rounded-3xl bg-[#0b1014]/80 backdrop-blur-sm p-8 shadow-2xl border border-white/10 max-w-md w-full">
            <p className="text-white text-center">Username não informado.</p>
            <Link
              href="/"
              className="mt-4 block text-center text-pink-500 hover:text-pink-400"
            >
              Voltar
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const result = await getProfileData(username);
  if (!result.data) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <MatrixBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
          <div className="rounded-3xl bg-[#0b1014]/80 backdrop-blur-sm p-8 shadow-2xl border border-white/10 max-w-md w-full">
            <p className="text-lg font-semibold text-white mb-2">
              Não foi possível carregar
            </p>
            <p className="text-sm text-white/70 mb-4">{result.error}</p>
            <Link
              href="/username"
              className="block text-center text-pink-500 hover:text-pink-400"
            >
              Corrigir @
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const profile = result.data.profile;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <MatrixBackground />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <div className="rounded-3xl bg-[#0b1014]/80 backdrop-blur-sm p-6 sm:p-8 shadow-2xl border border-white/10 max-w-md w-full">
          {/* Título */}
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent text-center mb-6">
            Confirmar Pesquisa
          </h2>

          {/* Pergunta */}
          <p className="text-white text-center mb-2">
            Você deseja espionar o perfil
          </p>
          <p className="text-2xl font-bold text-white text-center mb-6">
            @{profile.username}?
          </p>

          {/* Informações do Perfil */}
          <div className="space-y-4 mb-6">
            {/* Foto e Nome */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full overflow-hidden shrink-0">
                <Image
                  src={profile.profilePicUrl}
                  alt={profile.username}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white truncate">
                  {profile.fullName}
                </h3>
                {profile.biography && (
                  <p className="text-sm text-white/80 line-clamp-2">
                    {profile.biography}
                  </p>
                )}
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div className="text-center">
                <p className="text-xl font-bold text-white">
                  {profile.followerCount?.toLocaleString("pt-BR") || "—"}
                </p>
                <p className="text-xs text-white/60 mt-1">Seguidores</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white">
                  {profile.followingCount?.toLocaleString("pt-BR") || "—"}
                </p>
                <p className="text-xs text-white/60 mt-1">Seguindo</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white">
                  {profile.postCount?.toLocaleString("pt-BR") || "—"}
                </p>
                <p className="text-xs text-white/60 mt-1">Publicações</p>
              </div>
            </div>
          </div>

          {/* Aviso */}
          <div className="flex items-start gap-2 mb-6 p-3 rounded-lg bg-white/5">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ff0088"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 mt-0.5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <p className="text-xs text-white/70">
              Nossa plataforma libera somente uma pesquisa por pessoa, então
              confirme se realmente deseja espionar.
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <Link
              href="/username"
              className="flex-1 rounded-xl border border-white/20 bg-transparent px-4 py-3 text-center text-white font-medium hover:bg-white/5 transition"
            >
              Corrigir @
            </Link>
            <Link
              href={`/login/${profile.username}`}
              className="flex-1 rounded-xl bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 px-4 py-3 text-center text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition"
            >
              Confirmar
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

