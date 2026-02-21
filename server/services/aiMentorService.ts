import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { Ollama } from 'ollama';
import dotenv from 'dotenv';

dotenv.config();

// Ollama Setup
const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
const ollamaModel = process.env.OLLAMA_MODEL || 'llama3';
const ollama = new Ollama({ host: ollamaHost });

// Ollama Speed Options — read from .env for easy tuning without code changes
const OLLAMA_FAST_OPTIONS = {
    num_predict: parseInt(process.env.OLLAMA_NUM_PREDICT || '120'),  // Max tokens (lower = faster)
    num_ctx: parseInt(process.env.OLLAMA_NUM_CTX || '512'),          // Context window (smaller = faster)
    temperature: 0.3,   // More deterministic, less randomness
    top_k: 20,          // Restrict vocab sampling
    top_p: 0.8,
};

// For end-of-quiz deep report — allow more tokens but still optimized
const OLLAMA_REPORT_OPTIONS = {
    num_predict: parseInt(process.env.OLLAMA_NUM_PREDICT || '120') * 3, // 3x for full report
    num_ctx: parseInt(process.env.OLLAMA_NUM_CTX || '512') * 2,         // 2x context for report
    temperature: 0.3,
    top_k: 20,
    top_p: 0.8,
};

// Gemini Setup
const geminiApiKeys = (process.env.GEMINI_API_KEY || '').split(',').map(key => key.trim()).filter(key => key !== '');
const genAIs = geminiApiKeys.map(key => new GoogleGenerativeAI(key));

// OpenAI Setup
const openaiApiKeys = (process.env.OPENAI_API_KEY || '').split(',').map(key => key.trim()).filter(key => key !== '');
const openais = openaiApiKeys.map(key => new OpenAI({ apiKey: key }));

// Fallback logic for when AI is unavailable
const DEFAULT_FALLBACK_RESPONSE = "I'm currently resting to sharpen my knowledge! I'll be back in a moment to help you with your questions. In the meantime, why not try one of the practice quizzes?";

/**
 * Universal call helper that tries Ollama first, then Gemini, then OpenAI
 */
const callAIProviders = async (
    ollamaOp: () => Promise<any>,
    geminiOp: (genAI: GoogleGenerativeAI) => Promise<any>,
    openaiOp: (openai: OpenAI) => Promise<any>
) => {
    let lastError: any = null;

    // 1. Try Ollama (Local) first
    try {
        console.log(`Trying Ollama (${ollamaModel})...`);
        return await ollamaOp();
    } catch (error: any) {
        lastError = error;
        console.error(`Ollama Error:`, error.message);
        // If Ollama fails, fall back to other providers
    }

    // 2. Try OpenAI keys if available
    for (let i = 0; i < openais.length; i++) {
        try {
            console.log(`Trying OpenAI Key ${i + 1}...`);
            return await openaiOp(openais[i]);
        } catch (error: any) {
            lastError = error;
            console.error(`OpenAI Error (Key ${i + 1}):`, error.message);
            // If it's a quota issue (429), try next key
            if (error.status === 429 || error.status === 500 || error.status === 503) continue;
        }
    }

    // 3. Fallback to Gemini keys
    for (let i = 0; i < genAIs.length; i++) {
        try {
            console.log(`Fallback: Trying Gemini Key ${i + 1}...`);
            return await geminiOp(genAIs[i]);
        } catch (error: any) {
            lastError = error;
            console.error(`Gemini Error (Key ${i + 1}):`, error.status || error.message);
            // If it's a quota issue (429), try next key
            if (error.status === 429 || error.status === 503 || error.status === 500) continue;
        }
    }

    throw lastError || new Error("No AI providers available.");
};

export const generateMentorResponse = async (message: string, userContext: any) => {
    const level = userContext?.standard || userContext?.level || 8;
    const studentName = userContext?.studentName ? `, ${userContext.studentName}` : '';
    const weakTopics = Array.isArray(userContext?.weakTopics) ? userContext.weakTopics.join(', ') : 'None';
    const subjects = Array.isArray(userContext?.subjects) ? userContext.subjects.join(', ') : 'General Science & Math';

    const systemPrompt = `You are 'Yatsya', a concise AI mentor for Std ${level} students. Reply in 2-3 sentences max. Be warm and direct.`;
    const userPrompt = `Student${studentName} asks: "${message}"
Weak areas: ${weakTopics}. Answer helpfully and briefly.`;

    try {
        return await callAIProviders(
            async () => {
                const response = await ollama.chat({
                    model: ollamaModel,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    options: OLLAMA_FAST_OPTIONS,
                });
                return response.message.content;
            },
            async (genAI) => {
                const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
                const chat = model.startChat({
                    history: [
                        { role: "user", parts: [{ text: systemPrompt }] },
                        { role: "model", parts: [{ text: "Hello! I'm Yatsya, your personal AI mentor. How can I assist you today?" }] },
                    ],
                });
                const result = await chat.sendMessage(userPrompt);
                return (await result.response).text();
            },
            async (openaiClient) => {
                const response = await openaiClient.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt }
                    ],
                });
                return response.choices[0].message.content;
            }
        );
    } catch (error) {
        return DEFAULT_FALLBACK_RESPONSE;
    }
};

export const generateDailyPlan = async (userContext: any) => {
    const availableContentStr = userContext?.availableContent
        ? JSON.stringify(userContext.availableContent)
        : 'Standard 8-10 Math and Science curriculum';

    const prompt = `Generate a 4-task daily study plan for Std ${userContext?.level || 8}.
Weak topics: ${Array.isArray(userContext?.weakTopics) ? userContext.weakTopics.join(', ') : 'None'}.
Content: ${availableContentStr}
Respond ONLY with this JSON (no extra text):
{"tasks":[{"subject":"Math","topic":"Algebra","duration":"30 mins","type":"Practice"}]}`;

    try {
        return await callAIProviders(
            async () => {
                const response = await ollama.chat({
                    model: ollamaModel,
                    messages: [{ role: 'user', content: prompt }],
                    format: 'json',
                    options: OLLAMA_REPORT_OPTIONS,
                });
                return JSON.parse(response.message.content || '{}');
            },
            async (genAI) => {
                const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
                const result = await model.generateContent(prompt);
                const text = (await result.response).text();
                const jsonStart = text.indexOf('{');
                const jsonEnd = text.lastIndexOf('}');
                return JSON.parse(text.substring(jsonStart, jsonEnd + 1));
            },
            async (openaiClient) => {
                const response = await openaiClient.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: prompt }],
                    response_format: { type: "json_object" }
                });
                return JSON.parse(response.choices[0].message.content || '{}');
            }
        );
    } catch (error) {
        return {
            tasks: [
                { subject: "Math", topic: "General Revision", duration: "30 mins", type: "Practice" },
                { subject: "Science", topic: "Chapter Review", duration: "45 mins", type: "Reading" }
            ],
            isFallback: true
        };
    }
};

export const generateQuizFeedback = async (score: number, subjectName: string, chapterName: string, levelName: string, wrongAnswers: any[]) => {
    const wrongTopics = wrongAnswers.map((q: any) => q.question.subtopic?.name || q.question.difficulty).filter((v, i, a) => a.indexOf(v) === i);

    const prompt = `Quiz result: ${subjectName} > ${chapterName} (${levelName}), Score: ${score}%.
Wrong topics: ${wrongTopics.join(', ') || 'None'}.
Respond ONLY with this JSON:
{"feedback":"2-sentence encouragement.","recommendations":"- Topic: https://www.youtube.com/results?search_query=Topic"}`;

    try {
        return await callAIProviders(
            async () => {
                const response = await ollama.chat({
                    model: ollamaModel,
                    messages: [{ role: 'user', content: prompt }],
                    format: 'json',
                    options: OLLAMA_FAST_OPTIONS,
                });
                return JSON.parse(response.message.content || '{}');
            },
            async (genAI) => {
                const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
                const result = await model.generateContent(prompt);
                const text = (await result.response).text();
                const jsonStart = text.indexOf('{');
                const jsonEnd = text.lastIndexOf('}');
                return JSON.parse(text.substring(jsonStart, jsonEnd + 1));
            },
            async (openaiClient) => {
                const response = await openaiClient.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: prompt }],
                    response_format: { type: "json_object" }
                });
                return JSON.parse(response.choices[0].message.content || '{}');
            }
        );
    } catch (error) {
        return {
            feedback: score >= 80 ? "Great job! You have a solid understanding." : "Keep practicing! You're making progress.",
            recommendations: "Visit our subtopic section for more practice."
        };
    }
};

export const generateRemediation = async (question: any, type: 'UPGRADE' | 'DOWNGRADE') => {
    const prompt = type === 'UPGRADE'
        ? `Q: "${question.content}" Answer: "${question.options[question.correctOption]}". Student got it fast. Give a 2-sentence deep-dive: explain WHY it's correct + one real-world application. Be concise.`
        : `Q: "${question.content}" Answer: "${question.options[question.correctOption]}". Student struggled. Give a 2-sentence micro-lesson: simple analogy + how to remember it. Be encouraging.`;

    try {
        return await callAIProviders(
            async () => {
                const response = await ollama.chat({
                    model: ollamaModel,
                    messages: [{ role: 'user', content: prompt }],
                    options: OLLAMA_FAST_OPTIONS,
                });
                return response.message.content;
            },
            async (genAI) => {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-lite" });
                const result = await model.generateContent(prompt);
                return (await result.response).text();
            },
            async (openaiClient) => {
                const response = await openaiClient.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: prompt }]
                });
                return response.choices[0].message.content;
            }
        );
    } catch (error) {
        return type === 'UPGRADE'
            ? "Fascinating choice! This concept is fundamental to modern engineering. Keep up the high speed!"
            : "Think of this like a puzzle where every piece fits together. Take it step-by-step and you'll master it!";
    }
};
