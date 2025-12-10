const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

// Load env validation
const envPath = path.resolve(__dirname, "../.env.local");
const envConfig = dotenv.parse(fs.readFileSync(envPath));

async function listModels() {
    const apiKey = envConfig.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API KEY found in .env.local");
        return;
    }

    console.log("Using API Key (last 4):", apiKey.slice(-4));

    try {
        // Direct fetch because SDK listModels might be tricky to access in older versions or specific setups
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", JSON.stringify(data.error, null, 2));
        } else {
            console.log("Available Models:");
            console.log(data.models.map(m => m.name));
        }
    } catch (error) {
        console.error("Script Error:", error);
    }
}

listModels();
