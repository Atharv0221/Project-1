import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const generateMentorResponse = async (message: string, userContext: any) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "You are an AI Mentor for students in standard 8-10. Your name is 'Yatsya'. Be encouraging, helpful, and concise." }],
                },
                {
                    role: "model",
                    parts: [{ text: "Hello! I'm Yatsya, your personal AI mentor. I'm here to help you master your subjects and achieve your academic goals. How can I assist you today?" }],
                },
            ],
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        // Add user context if relevant
        const level = userContext?.level || 8;
        const weakTopics = Array.isArray(userContext?.weakTopics) ? userContext.weakTopics.join(', ') : 'None';
        const prompt = `Context: User is studying Standard ${level}. Weak topics: ${weakTopics}. Question: ${message}`;

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("I'm having trouble connecting right now. Please try again later.");
    }
};

export const generateDailyPlan = async (userContext: any) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `Generate a daily study plan for a student in Standard ${userContext?.level || 8}.
        Weak topics: ${userContext?.weakTopics?.join(', ') || 'None'}.
        Recent subjects: ${userContext?.recentSubjects?.join(', ') || 'None'}.
        Format the response as JSON with structure: { "tasks": [{ "subject": "Math", "topic": "Algebra", "duration": "30 mins", "type": "Practice" }] }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Basic cleanup to ensure JSON
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            return JSON.parse(text.substring(jsonStart, jsonEnd + 1));
        }
        return { tasks: [] };
    } catch (error) {
        console.error("Gemini Plan Error:", error);
        return { tasks: [] };
    }
};
