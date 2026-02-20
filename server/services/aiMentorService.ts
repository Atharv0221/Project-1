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

// Fallback logic for when AI is unavailable
const DEFAULT_FALLBACK_RESPONSE = "I'm currently resting to sharpen my knowledge! I'll be back in a moment to help you with your questions. In the meantime, why not try one of the practice quizzes?";

/**
 * Universal call helper that tries Gemini keys first, then OpenAI
 */
const callAIProviders = async (
    geminiOp: (genAI: GoogleGenerativeAI) => Promise<any>,
    openaiOp: (openai: OpenAI) => Promise<any>
) => {
    let lastError: any = null;

    // 1. Try OpenAI keys if available
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

    // 2. Fallback to Gemini keys
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

    const systemPrompt = "You are an AI Mentor for students in standard 8-10. Your name is 'Yatsya'. Be encouraging, helpful, and concise.";
    const userPrompt = `Context: User${studentName} is studying Standard ${level}.
    Their Course Payload: ${subjects}.
    Current Weak Areas: ${weakTopics}.

    Question: ${message}

    Guidance: Answer as 'Yatsya'. Be encouraging. if they ask about something outside their syllabus, gently guide them back or explain it simply.`;

    try {
        return await callAIProviders(
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

    const prompt = `Generate a daily study plan for a student in Standard ${userContext?.level || 8}.
    Weak topics: ${Array.isArray(userContext?.weakTopics) ? userContext.weakTopics.join(', ') : 'None'}.
    Available Content: ${availableContentStr}
    Format as JSON: { "tasks": [{ "subject": "Math", "topic": "Algebra", "duration": "30 mins", "type": "Practice" }] }`;

    try {
        return await callAIProviders(
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

    const prompt = `Analyze a student's performance in a quiz.
    Subject: ${subjectName}
    Chapter: ${chapterName}
    Level: ${levelName}
    Score: ${score}%
    Topics they got wrong: ${wrongTopics.join(', ') || 'None'}.
    
    Tasks:
    1. Provide 2-3 sentences of encouraging feedback.
    2. Identify specific subtopics they should revise.
    3. Provide 2-3 relevant YouTube search links for these subtopics.
    
    Format as JSON: 
    { 
        "feedback": "Encouraging feedback text here.",
        "recommendations": "List of subtopics and links like: \\n- Subtopic A: https://www.youtube.com/results?search_query=Subtopic+A\\n- Subtopic B: https://www.youtube.com/results?search_query=Subtopic+B"
    }`;

    try {
        return await callAIProviders(
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
        ? `The student answered this question correctly and quickly (Fast Learner). 
           Question: "${question.content}"
           Correct Answer: "${question.options[question.correctOption]}"
           
           Task: Provide a "Deep Dive" explanation. 
           1. Explain the scientific "Why" behind the answer in a bit more depth.
           2. Mention a real-world advanced application of this concept.
           Keep it concise (3-4 sentences total) and premium.`
        : `The student struggled with this question (Slow Learner).
           Question: "${question.content}"
           Correct Answer: "${question.options[question.correctOption]}"
           
           Task: Provide a "Micro-Lesson".
           1. Create a simplified, easy-to-understand analogy for this concept.
           2. Give a 2-step breakdown of how to solve/understand it.
           Keep it encouraging and very simple (3-4 sentences total).`;

    try {
        return await callAIProviders(
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
