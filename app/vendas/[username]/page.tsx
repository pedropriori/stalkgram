import scrapeInstagram from "@/app/api/instagram/instagram-scraper";
import Image from "next/image";
import Link from "next/link";
import MatrixBackground from "@/app/components/matrix-background";
import FAQAccordion from "@/app/components/faq-accordion";
import SaleTimer from "@/app/components/sale-timer";

interface PageParams {
  username?: string;
}

async function resolveParams(params: unknown): Promise<PageParams> {
  const resolved = await Promise.resolve(params as PageParams);
  return resolved || {};
}

async function getProfileData(username: string) {
  try {
    const data = await scrapeInstagram(username);
    return { data, error: "" };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao buscar dados do Instagram.";
    return { data: null, error: message };
  }
}

export default async function VendasPage({ params }: { params: PageParams | Promise<PageParams> }) {
  const resolved = await resolveParams(params);
  const username = resolved.username ?? "";

  if (!username) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto flex max-w-md flex-col">
          <div className="rounded-2xl border border-white/10 bg-rose-500/10 p-5 text-rose-100">
            <p className="text-lg font-semibold">Username não informado.</p>
            <p className="mt-2 text-sm text-rose-50/90">Acesse via /vendas/@usuario.</p>
          </div>
        </div>
      </main>
    );
  }

  const result = await getProfileData(username);
  if (!result.data) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto flex max-w-md flex-col">
          <div className="rounded-2xl border border-white/10 bg-rose-500/10 p-5 text-rose-100">
            <p className="text-lg font-semibold">Não foi possível carregar</p>
            <p className="mt-2 text-sm text-rose-50/90">{result.error}</p>
          </div>
        </div>
      </main>
    );
  }

  const profile = result.data.profile;

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <MatrixBackground />
      <SaleTimer />
      <div className="relative z-10 pt-16">
        <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Logo e Tagline */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="StalkGram Logo"
              width={200}
              height={60}
              className="h-auto w-auto"
              priority
            />
          </div>
          <p className="text-lg text-white/80">A maior ferramenta de stalkear do Brasil</p>
        </div>

        {/* Seção de Acesso ao Perfil */}
        <div className="mb-12 rounded-2xl border border-white/10 bg-gray-900 p-6">
          <h2 className="mb-4 text-center text-xl font-bold text-white">
            Acesso completo ao perfil de:
          </h2>
          <div className="mb-4 text-center">
            <p className="mb-4 text-2xl font-bold text-white">@{profile.username}</p>
            <div className="mb-4 flex justify-center">
              <div className="h-20 w-20 rounded-full bg-gray-700 flex items-center justify-center">
                <Image
                  src={profile.profilePicUrl}
                  alt={profile.username}
                  width={80}
                  height={80}
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
            </div>
            <p className="mb-4 text-lg font-semibold text-white">{profile.fullName || profile.username}</p>
            <div className="flex justify-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{profile.postCount || 0}</p>
                <p className="text-sm text-white/60">publicações</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{profile.followerCount || 0}</p>
                <p className="text-sm text-white/60">seguidores</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{profile.followingCount || 0}</p>
                <p className="text-sm text-white/60">seguindo</p>
              </div>
            </div>
          </div>
          {profile.biography && (
            <div className="mb-4 text-center">
              <p className="text-sm text-white whitespace-pre-line">
                {profile.biography.replace(/\n/g, ' ')}
              </p>
            </div>
          )}
          <button className="w-full rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 transition">
            <div className="flex flex-col items-center gap-0.5">
              <div>
                <span>Sem precisar de senha. </span>
                <span>Sem deixar rastros.</span>
              </div>
              <div>
                <span>Sem que a pessoa saiba.</span>
              </div>
            </div>
          </button>
        </div>

        {/* Seta animada */}
        <div className="mb-12 flex justify-center">
          <div className="animate-bounce">
            <svg width="24" height="48" viewBox="0 0 24 48" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="0" x2="12" y2="36" />
              <path d="M6 30l6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* Features do StalkGram */}
        <div className="mb-12 space-y-8">
          <h2 className="mb-6 text-center text-2xl font-bold text-white">
            O que você terá acesso:
          </h2>

          {/* Feature 1: Mídias */}
          <div className="rounded-2xl border border-white/10 bg-gray-900 p-6">
            <div className="mb-4 flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
              <h3 className="text-lg font-bold text-white">
                Todas as mídias recebidas e enviadas por @{profile.username}
              </h3>
            </div>
            <p className="mb-4 text-sm text-white/70">
              Incluindo arquivos ocultos que não estão 'visíveis pra todos'.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={`https://picsum.photos/seed/${i}${profile.username}/400/400`}
                    alt="Mídia"
                    width={400}
                    height={400}
                    className="h-full w-full object-cover blur-md"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature 2: Localização */}
          <div className="rounded-2xl border border-white/10 bg-gray-900/80 backdrop-blur-sm p-6">
            <div className="mb-4 flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <h3 className="text-lg font-bold text-white">
                Localização em tempo real de @{profile.username}
              </h3>
            </div>
            <p className="mb-4 text-sm text-white/70">
              Veja onde a pessoa está agora e por onde passou nas últimas horas.
            </p>
            <div className="relative rounded-lg overflow-hidden border border-white/10">
              {/* Mapa desfocado no topo */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src="/images/maps.png"
                  alt="Mapa"
                  width={600}
                  height={400}
                  className="h-full w-full object-cover blur-sm"
                />
              </div>
              {/* Painel de informações no fundo */}
              <div className="bg-gray-800 p-4">
                <p className="text-base font-bold text-white mb-1">Localização atual</p>
                <p className="text-sm text-white/90 mb-4">@{profile.username} está compartilhando</p>
                <button className="w-full rounded-lg bg-gray-700 hover:bg-gray-600 px-4 py-2.5 text-sm font-semibold text-white transition">
                  Ver
                </button>
              </div>
            </div>
          </div>

          {/* Feature 3: Stories e Posts Ocultos */}
          <div className="rounded-2xl border border-white/10 bg-gray-900/80 backdrop-blur-sm p-6">
            <div className="mb-4 flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <h3 className="text-lg font-bold text-white">Stories e posts ocultos</h3>
            </div>
            <p className="mb-2 text-sm text-white/70">
              Aqueles postados pra "Melhores Amigos" ou ocultados de você.
            </p>
            <p className="mb-4 text-sm font-semibold text-white/90">
              Você verá mesmo se o perfil for privado.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="relative aspect-[4/5] rounded-lg overflow-hidden">
                  <Image
                    src={`https://picsum.photos/seed/story${i}${profile.username}/400/500`}
                    alt="Story"
                    width={400}
                    height={500}
                    className="h-full w-full object-cover blur-md"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/30 text-center">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="drop-shadow-lg">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <p className="text-sm font-semibold text-white drop-shadow-lg text-center">Conteúdo restrito</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature 4: Directs */}
          <div className="rounded-2xl border border-white/10 bg-gray-900 p-6">
            <div className="mb-4 flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <h3 className="text-lg font-bold text-white">
                Mensagens privadas do Instagram (Directs)
              </h3>
            </div>
            <p className="mb-1 text-sm text-white">
              Veja o que @{profile.username} fala no privado.
            </p>
            <p className="mb-6 text-sm text-white">
              Conversas, fotos, vídeos, áudios, contatos... tudo.
            </p>
            
            {/* Primeiro Chat */}
            <div className="mb-4 rounded-lg bg-gray-800 overflow-hidden">
              {/* Header do Chat */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                  <div className="h-10 w-10 rounded-full border-2 border-white/20 bg-gray-700 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white blur-sm">Nome desfocado</p>
                    <p className="text-xs text-white/60">online</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
              </div>
              {/* Mensagens */}
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 max-w-[70%] rounded-lg bg-gray-700 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <span className="text-sm text-white">Ligação de vídeo</span>
                    </div>
                    <div className="mt-0.5 ml-7">
                      <span className="text-xs text-white/50 blur-sm">1:2</span><span className="text-xs text-white/50">47</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2 justify-end">
                  <div className="flex-1 max-w-[70%] rounded-lg bg-purple-600 px-3 py-2">
                    <p className="text-xs text-white blur-sm">Mensagem desfocada</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 justify-end">
                  <div className="flex-1 max-w-[70%] rounded-lg bg-purple-600 px-3 py-2">
                    <p className="text-xs text-white blur-sm">Mensagem desfocada</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Segundo Chat */}
            <div className="rounded-lg bg-gray-800 overflow-hidden">
              {/* Header do Chat */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                  <div className="h-10 w-10 rounded-full border-2 border-white/20 bg-gray-700 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white blur-sm">Nome desfocado</p>
                    <p className="text-xs text-white/60">online</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
              </div>
              {/* Mensagens */}
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 max-w-[70%] rounded-lg bg-gray-700 px-3 py-2">
                    <p className="text-xs text-white blur-sm">Mensagem desfocada</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 justify-end">
                  <div className="flex-1 max-w-[70%] rounded-lg bg-purple-600 px-3 py-2">
                    <p className="text-xs text-white blur-sm">Mensagem desfocada</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 justify-end">
                  <div className="flex-1 max-w-[70%] rounded-lg bg-purple-600 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <span className="text-sm text-white">Ligação de voz</span>
                    </div>
                    <div className="mt-0.5 ml-7">
                      <span className="text-xs text-white/50 blur-sm">0:</span><span className="text-xs text-white/50">32</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex-1 max-w-[70%] rounded-lg bg-gray-700 px-3 py-2">
                    <p className="text-xs text-white blur-sm">Mensagem desfocada</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seta animada */}
        <div className="mb-12 flex justify-center">
          <div className="animate-bounce">
            <svg width="24" height="48" viewBox="0 0 24 48" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="0" x2="12" y2="36" />
              <path d="M6 30l6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* Depoimentos */}
        <div className="mb-12">
          <h2 className="mb-6 text-center text-2xl font-bold text-white">
            Veja o que falam as pessoas que usam o StalkGram:
          </h2>
          <div className="space-y-0 divide-y divide-white/10 rounded-2xl border border-white/10 bg-gray-900/80 backdrop-blur-sm overflow-hidden">
            {[
              {
                icon: "profile",
                username: "maria_s****",
                time: "3h",
                text: "Eu tava desconfiando, mas não tinha certeza... Quando paguei a versão completa vi os directs e os stories escondidos fiquei sem chão. Mas pelo menos eu soube a verdade.",
              },
              {
                icon: "lock",
                username: "j*****",
                time: "5h",
                text: "Usei no insta de uma ficante minha vi que ele tava com outro há meses. A ferramenta me deu paz.",
              },
              {
                icon: "profile",
                username: "ana_c****",
                time: "1d",
                text: "Achei que era fake no começo. na versão completa eu testei com @ do boy e vi um monte de coisa kkkkk. Localização, fotos escondidas, até conversas apagadas.",
              },
              {
                icon: "lock",
                username: "p*****",
                time: "5d",
                text: "a função de ver a localização em tempo real é muito bom kkkkk",
              },
              {
                icon: "blurred",
                username: "l*****",
                time: "3 sem",
                text: "não vivo sem essa ferramenta, conheci ela uns meses atrás no tiktok e até hoje uso em alguns perfis que to desconfiado",
              },
              {
                icon: "profile",
                username: "c*****",
                time: "2 sem",
                text: "Não recomendo pra quem não quer ver a verdade.",
              },
            ].map((testimonial, index) => (
              <div key={index} className="flex items-start gap-3 p-4 hover:bg-white/5 transition">
                <div className="shrink-0">
                  {testimonial.icon === "profile" ? (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  ) : testimonial.icon === "lock" ? (
                    <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center blur-sm">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white blur-sm select-none">
                      {testimonial.username}
                    </span>
                    <span className="text-xs text-white/60">{testimonial.time}</span>
                  </div>
                  <p className="text-sm text-white leading-relaxed">{testimonial.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefícios */}
        <div className="mb-12 rounded-2xl border border-white/10 bg-gray-900 p-6">
          <h2 className="mb-6 text-center text-xl font-bold text-white">
            Além do acesso ao perfil de <span className="bg-gradient-to-r from-pink-500 to-yellow-500 bg-clip-text text-transparent">@{profile.username}</span>, você poderá ter acesso a ferramenta do StalkGram
          </h2>
          <div className="space-y-3">
            {[
              "Espionar qualquer perfil que quiser.",
              "Visualizar todas as mídias com apenas um clique.",
              "Ter acesso vitalício sem pagar mensalidade.",
              "Sem banimento, serviço funciona na NUVEM.",
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <p className="text-white">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Controle de Perfis */}
        <div className="mb-12 rounded-2xl border border-white/10 bg-gray-900 p-6">
          <h2 className="mb-6 text-center text-2xl font-bold text-white">
            Tenha o controle de qualquer perfil em suas mãos!
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <p className="text-white">Descobrir uma traição antes de ser feita de trouxa</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <p className="text-white">Espionar quem você ama em silêncio</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <circle cx="9" cy="9" r="1" />
                  <circle cx="15" cy="9" r="1" />
                  <circle cx="12" cy="9" r="1" />
                </svg>
              </div>
              <p className="text-white">Ver se alguém tá falando mal de você pelas costas</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>
              <p className="text-white">Proteger sua família, sua relação, sua paz</p>
            </div>
          </div>
        </div>

        {/* Banner de Aviso */}
        <div className="mb-12 rounded-xl bg-red-600 p-4 text-center">
          <p className="mb-1 text-base font-bold text-white">BEM COMPREENSÍVEL, VOCÊ NÃO VÊ NADA</p>
          <p className="text-xs text-white/90">
            Clique para desbloquear os dados de @{profile.username} e tenha acesso.
          </p>
        </div>

        {/* Planos */}
        <div className="mb-12">
          <div className="mb-6 mx-auto max-w-xs rounded-full bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 p-2.5 text-center animate-pulse-opacity">
            <p className="text-sm font-bold text-white">PROMOÇÃO FIM DE ANO - LIMITADA</p>
          </div>
          <h2 className="mb-2 text-center text-3xl font-bold text-white">ESCOLHA SEU PLANO</h2>
          <p className="mb-8 text-center text-sm text-white/60">POR TEMPO LIMITADO</p>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Plano 1 */}
            <div className="rounded-2xl border border-white/10 bg-gray-900 p-6">
              <h3 className="mb-4 text-xl font-bold text-white">Apenas acesso ao perfil</h3>
              <p className="mb-4 text-sm text-white/70">Acesso ao perfil de @{profile.username}</p>
              <div className="mb-4">
                <p className="text-sm text-white/60 line-through">De R$ 109,90</p>
                <p className="text-3xl font-bold text-white">R$ 49,90</p>
              </div>
              <ul className="mb-6 space-y-2">
                {[
                  "Acesso oculto de 8 mídias",
                  "Stories ocultos",
                  "Directs em tempo real",
                  "Localização em tempo real",
                  "Acesso a mídias (fotos e vídeos)",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-sm text-white">{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full rounded-lg bg-green-500 px-4 py-3 font-semibold text-white hover:bg-green-600 transition">
                Comprar Plano
              </button>
            </div>

            {/* Plano 2 - Mais Escolhido */}
            <div className="rounded-2xl border-2 border-green-500 bg-gray-900 p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-green-500 px-4 py-1">
                <p className="text-xs font-bold text-white">MAIS ESCOLHIDO</p>
              </div>
              <h3 className="mb-4 mt-4 text-xl font-bold text-white">
                Acesso ao perfil de @{profile.username} + Ferramenta completa do StalkGram
              </h3>
              <p className="mb-4 text-sm font-semibold text-green-400">
                ACESSO COMPLETO + FERRAMENTA VITALÍCIA
              </p>
              <div className="mb-4">
                <p className="text-sm text-white/60 line-through">De R$ 274,90</p>
                <p className="text-3xl font-bold text-white">R$ 59,90</p>
              </div>
              <ul className="mb-6 space-y-2">
                {[
                  "Acesso oculto de 8 mídias",
                  "Stories ocultos",
                  "Directs em tempo real",
                  "Localização em tempo real",
                  "Acesso a mídias (fotos e vídeos)",
                  "Notificações em tempo real",
                  "Relatório detalhado",
                  "Espionar quantos perfis quiser (ILIMITADO)",
                  "Acesso vitalício",
                  "Sem mensalidades",
                  "Localizações antigas e relatório de locais",
                  "Limpar rastros (em 10 meses úteis)",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-sm text-white">{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full rounded-lg bg-green-500 px-4 py-3 font-semibold text-white hover:bg-green-600 transition">
                Comprar Plano
              </button>
            </div>
          </div>
        </div>

        {/* Garantia */}
        <div className="mb-12 rounded-2xl border border-green-500 bg-green-500/10 p-6 text-center">
          <div className="mb-4 flex justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-bold text-white">Garantia de 30 Dias</h3>
          <p className="text-sm text-white/80">
            Teste sem riscos! Se não gostar, devolvemos 100% do seu dinheiro.
          </p>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="mb-6 text-center text-2xl font-bold text-white">Perguntas Frequentes</h2>
          <FAQAccordion
            items={[
              {
                question: "A ferramenta realmente funciona?",
                answer: "Sim! Nossa ferramenta acessa dados públicos e privados de perfis do Instagram de forma 100% invisível. Milhares de pessoas já usaram e descobriram a verdade.",
              },
              {
                question: "A pessoa vai saber que eu stalkeei o perfil dela?",
                answer: "Não! Nosso sistema é completamente invisível. Não deixamos rastros e a pessoa nunca vai saber que você viu o perfil dela.",
              },
              {
                question: "Funciona em perfis privados?",
                answer: "Sim! Nossa tecnologia consegue acessar informações de perfis privados, incluindo stories ocultos, mensagens e localização.",
              },
              {
                question: "Preciso instalar alguma coisa?",
                answer: "Não! A ferramenta funciona 100% na nuvem. Você só precisa ter acesso à internet e pode usar de qualquer dispositivo.",
              },
              {
                question: "Como funciona a garantia?",
                answer: "Você tem 30 dias para testar. Se não gostar, devolvemos 100% do seu dinheiro sem perguntas.",
              },
              {
                question: "Quanto tempo terei acesso?",
                answer: "Com o Plano StalkGram, você tem acesso VITALÍCIO! Pague uma vez e use para sempre, sem mensalidades.",
              },
            ]}
          />
        </div>
        </div>
      </div>
    </main>
  );
}

