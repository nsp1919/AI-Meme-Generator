import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: "GOOGLE_GEMINI_API_KEY is not configured" },
            { status: 500 }
        );
    }

    try {
        const { topText, bottomText, desc } = await req.json();

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
      Write a funny, viral Instagram Caption and 30 trending hashtags for a meme.
      
      Meme Context:
      - Top Text: "${topText || ''}"
      - Bottom Text: "${bottomText || ''}"
      - Visual Description: "${desc || ''}"
      - Cultural Context: South Indian / Telugu / Gen Z humor.

      Return ONLY a raw JSON object (no markdown) with this structure:
      {
        "caption": "string (The main caption text, use emojis)",
        "hashtags": "string (A single string of space-separated hashtags e.g. #meme #viral)"
      }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const data = JSON.parse(text);

        return NextResponse.json(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Gemini Caption Error:", error);
        return NextResponse.json(
            { error: "Failed to generate caption" },
            { status: 500 }
        );
    }
}
