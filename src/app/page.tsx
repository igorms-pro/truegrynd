import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <main className="flex w-full max-w-lg flex-col items-center gap-10 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Truegrynd
          </h1>
          <p className="text-lg italic text-muted-foreground">
            &ldquo;L&apos;effort ne s&apos;achète pas, il se prouve.&rdquo;
          </p>
        </div>
        <p className="max-w-md text-base text-muted-foreground">
          Async fitness competition. Take on standardized challenges, climb the global leaderboard.
          Free. No luxury price tag — just grit.
        </p>
        <Link
          href="/"
          className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          aria-label="Enter the arena"
        >
          Enter the arena
        </Link>
      </main>
    </div>
  );
}
