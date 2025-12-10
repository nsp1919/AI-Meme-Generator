import { MemeGenerator } from "@/components/meme-generator";

export default function GeneratePage() {
    return (
        <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col items-center gap-8 row-start-2 items-center sm:items-start w-full">
                <div className="w-full text-center space-y-4 mb-8">
                    <h1 className="text-4xl font-bold tracking-tight">AI Meme Generator</h1>
                    <p className="text-muted-foreground">Turn your ideas into visual content in seconds.</p>
                </div>
                <MemeGenerator />
            </main>
        </div>
    );
}
