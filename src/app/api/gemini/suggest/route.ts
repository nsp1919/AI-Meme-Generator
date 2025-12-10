import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: "GOOGLE_GEMINI_API_KEY is not configured" },
            { status: 500 }
        );
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const today = new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });

        const prompt = `
      Generate 10 trending, funny, and relevant meme concepts for today, ${today}, specifically focused on South Indian culture (movies, daily life, food, tech).
      
      CRITICAL: The "topText" and "bottomText" MUST be in TELUGU language (Telugu Script). 
      The "visualPrompt" must be in English for the image generator.

      Focus on:
      - Tollywood references (Brahmanandam, Ali, Venky, etc.)
      - Hyderabad/Bangalore tech life
      - South Indian parents/food
      
      Return ONLY a raw JSON array (no markdown code blocks) of objects with this exact structure:
      [
        {
          "topText": "string (Telugu text)",
          "bottomText": "string (Telugu text)",
          "visualPrompt": "string (Descriptive English visual for AI image generator)"
        }
      ]
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up if Gemini returns markdown code blocks
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        const suggestions = JSON.parse(text);

        return NextResponse.json({ suggestions });
    } catch (error: any) {
        console.error("Gemini API Error Detail:", JSON.stringify(error, null, 2));
        console.error("Gemini Error Message:", error.message);
        if (error.response) {
            console.error("Gemini Error Response:", JSON.stringify(error.response, null, 2));
        }
        return NextResponse.json(
            { error: "Failed to generate suggestions", details: error.message },
            { status: 500 }
        );
    }
}
