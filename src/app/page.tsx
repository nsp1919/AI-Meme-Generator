import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <main className="flex flex-col items-center gap-8 text-center p-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
          AI Meme Generator
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg">
          Create hilarious memes and reels in seconds using the power of AI.
          Just describe it, and we&apos;ll generate it.
        </p>
        <div className="flex gap-4">
          <Link href="/generate">
            <Button className="px-8 py-6 text-lg">Get Started</Button>
          </Link>
          <Link href="/gallery">
            <Button className="px-8 py-6 text-lg bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700">
              View Gallery
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
