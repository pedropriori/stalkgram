import HeroForm from "./components/hero-form";
import MatrixBackground from "./components/matrix-background";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <MatrixBackground />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <HeroForm />
        </div>
        </div>
      </main>
  );
}
