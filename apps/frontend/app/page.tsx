async function getHealth() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/api/health`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as { status: string; timestamp: string };
  } catch {
    return null;
  }
}

export default async function Home() {
  const health = await getHealth();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">ClientFlow Lite</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Turborepo • Next.js (frontend) + Express (backend)
        </p>
      </div>

      <div className="w-full max-w-xl rounded-xl border p-4 bg-zinc-50 dark:bg-zinc-900">
        <h2 className="font-semibold mb-2">Backend Health</h2>
        {health ? (
          <pre className="text-sm overflow-auto">{JSON.stringify(health, null, 2)}</pre>
        ) : (
          <p className="text-sm text-amber-600">
            Backend not reachable at {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}
            <br />
            Run <code className="bg-white dark:bg-black px-1 rounded">pnpm dev</code> to start both apps.
          </p>
        )}
      </div>

      <div className="flex gap-2 text-sm">
        <a
          className="px-3 py-1.5 rounded-md bg-black text-white dark:bg-white dark:text-black"
          href="http://localhost:5000/api/health"
          target="_blank"
          rel="noreferrer"
        >
          Call API directly
        </a>
        <a
          className="px-3 py-1.5 rounded-md border"
          href="https://turbo.build/repo/docs"
          target="_blank"
          rel="noreferrer"
        >
          Turborepo Docs
        </a>
      </div>
    </main>
  );
}
