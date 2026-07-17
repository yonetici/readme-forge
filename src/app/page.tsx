import { Builder } from "@/components/Builder";

export default function Home() {
  return (
    <main>
      <header className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
          README <span className="text-emerald-400">Forge</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Build a GitHub profile README that doesn&apos;t rot. Version-pinned icons, stats rendered inside{" "}
          <em>your</em> repo by GitHub Actions, and a Link Doctor that heals existing profiles.
        </p>
      </header>
      <Builder />
    </main>
  );
}
