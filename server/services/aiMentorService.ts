import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Gemini Setup
const geminiApiKeys = (process.env.GEMINI_API_KEY || '').split(',').map(key => key.trim()).filter(key => key !== '');
const genAIs = geminiApiKeys.map(key => new GoogleGenerativeAI(key));

// OpenAI Setup
const openaiApiKeys = (process.env.OPENAI_API_KEY || '').split(',').map(key => key.trim()).filter(key => key !== '');
const openais = openaiApiKeys.map(key => new OpenAI({ apiKey: key }));

// Ollama Setup (OpenAI-compatible)
const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1';
const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2:1b';
const ollama = new OpenAI({
    baseURL: ollamaBaseUrl,
    apiKey: 'ollama', // Required by library but not used by Ollama
});

// Fallback logic for when AI is unavailable
const DEFAULT_FALLBACK_RESPONSE = "I'm currently resting to sharpen my knowledge! I'll be back in a moment to help you with your questions. In the meantime, why not try one of the practice quizzes?";

/**
 * Universal call helper that tries Ollama first, then OpenAI keys, then Gemini
 */
const callAIProviders = async (
    ollamaOp: () => Promise<any>,
    geminiOp: (genAI: GoogleGenerativeAI) => Promise<any>,
    openaiOp: (openai: OpenAI, model?: string) => Promise<any>
) => {
    let lastError: any = null;

    // 1. Try Ollama (Local & Fast)
    if (process.env.OLLAMA_BASE_URL) {
        try {
            console.log(`Trying Ollama (${ollamaModel})...`);
            return await openaiOp(ollama, ollamaModel);
        } catch (error: any) {
            lastError = error;
            console.error(`Ollama Error:`, error.message);
            // Continue to cloud providers if Ollama fails
        }
    }

    // 2. Try OpenAI keys if available
    for (let i = 0; i < openais.length; i++) {
        try {
            console.log(`Trying OpenAI Key ${i + 1}...`);
            return await openaiOp(openais[i]);
        } catch (error: any) {
            lastError = error;
            console.error(`OpenAI Error (Key ${i + 1}):`, error.message);
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
                // Not used directly — Ollama uses the openaiOp path
                throw new Error('Use openaiOp for Ollama');
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
            async (openaiClient, modelOverride) => {
                const response = await openaiClient.chat.completions.create({
                    model: modelOverride || "gpt-4o-mini",
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
                throw new Error('Use openaiOp for Ollama');
            },
            async (genAI) => {
                const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
                const result = await model.generateContent(prompt);
                const text = (await result.response).text();
                const jsonStart = text.indexOf('{');
                const jsonEnd = text.lastIndexOf('}');
                return JSON.parse(text.substring(jsonStart, jsonEnd + 1));
            },
            async (openaiClient, modelOverride) => {
                const response = await openaiClient.chat.completions.create({
                    model: modelOverride || "gpt-4o-mini",
                    messages: [{ role: "user", content: prompt }],
                    response_format: modelOverride ? undefined : { type: "json_object" }
                });
                const content = response.choices[0].message.content || '{}';
                const jsonStart = content.indexOf('{');
                const jsonEnd = content.lastIndexOf('}');
                return JSON.parse(content.substring(jsonStart, jsonEnd + 1));
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
    // Micro-level analysis: Group wrong answers by subtopic
    const subtopicStatus = wrongAnswers.reduce((acc: any, curr: any) => {
        const subtopic = curr.question.subtopic?.name || 'General';
        acc[subtopic] = (acc[subtopic] || 0) + 1;
        return acc;
    }, {});

    const wrongSubtopicsStr = Object.entries(subtopicStatus)
        .map(([name, count]) => `${name} (${count} errors)`)
        .join(', ');

    const prompt = `Analyze a student's performance in a quiz. 
    Subject: ${subjectName}
    Chapter: ${chapterName}
    Level: ${levelName}
    Score: ${score}%
    
    Micro-Level Analysis (Subtopic Errors): ${wrongSubtopicsStr || 'None. Perfect score!'}
    
    Tasks:
    1. Provide 2-3 sentences of encouraging, personalized feedback as 'Yatsya'.
    2. Identify specific micro-topics (subtopics) they should revise based on the errors.
    3. Provide 2-3 relevant YouTube search links for these specific subtopics.
    
    Format as JSON: 
    { 
        "feedback": "Encouraging feedback text here.",
        "recommendations": "List of subtopics and links like: \\n- Subtopic A: https://www.youtube.com/results?search_query=Subtopic+A\\n- Subtopic B: https://www.youtube.com/results?search_query=Subtopic+B"
    }`;

    try {
        return await callAIProviders(
            async () => {
                throw new Error('Use openaiOp for Ollama');
            },
            async (genAI) => {
                const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
                const result = await model.generateContent(prompt);
                const text = (await result.response).text();
                const jsonStart = text.indexOf('{');
                const jsonEnd = text.lastIndexOf('}');
                return JSON.parse(text.substring(jsonStart, jsonEnd + 1));
            },
            async (openaiClient, modelOverride) => {
                const response = await openaiClient.chat.completions.create({
                    model: modelOverride || "gpt-4o-mini",
                    messages: [{ role: "user", content: prompt }],
                    response_format: modelOverride ? undefined : { type: "json_object" }
                });
                const content = response.choices[0].message.content || '{}';
                const jsonStart = content.indexOf('{');
                const jsonEnd = content.lastIndexOf('}');
                return JSON.parse(content.substring(jsonStart, jsonEnd + 1));
            }
        );
    } catch (error) {
        return {
            feedback: score >= 80 ? "Great job! You have a solid understanding." : "Keep practicing! You're making progress.",
            recommendations: "Visit our subtopic section for more practice."
        };
    }
};

export const generateRemediation = async (question: any, type: 'UPGRADE' | 'DOWNGRADE' | 'NONE') => {
    const subtopic = question.subtopic?.name || 'this topic';
    const chapter = question.level?.chapter?.name || '';

    const contextStr = chapter ? `in Chapter "${chapter}", specifically on "${subtopic}"` : `on "${subtopic}"`;

    let prompt = '';

    if (type === 'UPGRADE') {
        prompt = `The student answered this question correctly and quickly! (Fast Learner)
           Question: "${question.content}"
           Correct Answer: "${question.options[question.correctOption]}"
           Context: They are studying ${contextStr}.
           
           Task: Provide a "Deep Dive" enrichment as 'Yatsya'. 
           1. Briefly explain the scientific "Why" behind the answer.
           2. Mention a fascinating real-world application or extreme example of this concept.
           Keep it concise (3-4 sentences) and very premium.`;
    } else if (type === 'DOWNGRADE') {
        prompt = `The student struggled with this question.
           Question: "${question.content}"
           Correct Answer: "${question.options[question.correctOption]}"
           Context: They are studying ${contextStr}.
           
           Task: Provide a "Micro-Lesson" as 'Yatsya'.
           1. Use a simple, relatable analogy for this specific concept.
           2. Give a 2-step breakdown to remember/solve this next time.
           Keep it encouraging, very simple, and concise (3-4 sentences).`;
    } else {
        // type === 'NONE' or default
        prompt = `The student answered this question correctly.
           Question: "${question.content}"
           Correct Answer: "${question.options[question.correctOption]}"
           Context: They are studying ${contextStr}.
           
           Task: Provide a "Reinforcement Tip" as 'Yatsya'.
           1. Mention one related key fact or a "Did you know?" about this subtopic.
           2. Briefly explain why this concept is important to the rest of the chapter.
           Keep it encouraging and very concise (2-3 sentences).`;
    }

    try {
        return await callAIProviders(
            async () => {
                throw new Error('Use openaiOp for Ollama');
            },
            async (genAI) => {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-lite" });
                const result = await model.generateContent(prompt);
                return (await result.response).text();
            },
            async (openaiClient, modelOverride) => {
                const response = await openaiClient.chat.completions.create({
                    model: modelOverride || "gpt-4o-mini",
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
