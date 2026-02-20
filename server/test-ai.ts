import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the server directory
dotenv.config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("Error: GEMINI_API_KEY not found in .env file.");
    process.exit(1);
}

import OpenAI from 'openai';
// ...
async function testConnection() {
    // Test OpenAI
    const openaiKeyRaw = process.env.OPENAI_API_KEY || '';
    const openaiKeys = openaiKeyRaw.split(',').map(k => k.trim()).filter(k => k !== '');

    console.log(`\n--- Testing ${openaiKeys.length} OpenAI Keys (Default) ---`);
    if (openaiKeys.length > 0) {
        for (let i = 0; i < openaiKeys.length; i++) {
            const key = openaiKeys[i];
            console.log(`\nTesting OpenAI Key ${i + 1}:`);
            try {
                const openaiClient = new OpenAI({ apiKey: key });
                const response = await openaiClient.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: "Hi" }],
                });
                console.log(`✅ OpenAI SUCCESS:`, response.choices[0].message.content?.substring(0, 30) + "...");
            } catch (e: any) {
                console.log(`❌ OpenAI FAILED:`, e.message);
                if (i === openaiKeys.length - 1) {
                    console.log(`(All OpenAI keys failed, system will fall back to Gemini)`);
                }
            }
        }
    } else {
        console.log("⚠️ OpenAI Key not found in .env");
    }

    // Test Gemini Keys
    const geminiKeys = (apiKey || '').split(',').map(k => k.trim()).filter(k => k !== '');
    console.log(`\n--- Testing Gemini Keys (Fallback) ---`);
    for (let i = 0; i < geminiKeys.length; i++) {
        const key = geminiKeys[i];
        console.log(`\nTesting Gemini Key ${i + 1}:`);
        try {
            const genAI = new GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
            const result = await model.generateContent("Hi");
            console.log(`✅ Gemini SUCCESS:`, (await result.response).text().substring(0, 30) + "...");
        } catch (e: any) {
            console.log(`❌ Gemini FAILED:`, e.message);
        }
    }
}

testConnection();
