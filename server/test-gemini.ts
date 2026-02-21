import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function testGemini() {
    const apiKeyRaw = process.env.GEMINI_API_KEY || '';
    const keys = apiKeyRaw.split(',').map(k => k.trim()).filter(k => k !== '');

    if (keys.length === 0) {
        console.error("❌ Error: No GEMINI_API_KEY found in .env");
        return;
    }

    console.log(`--- Testing ${keys.length} Gemini API Key(s) ---`);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        console.log(`\nTesting Key ${i + 1}: ${key.substring(0, 8)}...`);
        try {
            const genAI = new GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent("Say 'Gemini is working!'");
            const response = await result.response;
            console.log(`✅ SUCCESS: ${response.text()}`);
        } catch (error: any) {
            console.error(`❌ FAILED: ${error.message}`);
        }
    }
}

testGemini();
