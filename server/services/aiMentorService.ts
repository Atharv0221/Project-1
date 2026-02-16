import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `You are an expert AI Learning Mentor for the Yatsya adaptive learning platform. Your role is to:

1. Provide personalized study guidance and explanations
2. Help students understand difficult concepts in Mathematics, Physics, Chemistry, and other subjects
3. Suggest effective learning strategies based on their progress
4. Motivate and encourage students in their learning journey
5. Break down complex topics into digestible explanations
6. Provide practice problems and study tips

Always be encouraging, patient, and adapt your explanations to the student's level. Use examples and analogies to make concepts clearer.`;

interface ChatMessage {
    role: 'user' | 'model';
    parts: string;
}

export async function generateMentorResponse(
    userMessage: string,
    userContext?: {
        weakTopics?: string[];
        recentSubjects?: string[];
        level?: number;
    }
): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Build context-aware prompt
        let contextPrompt = SYSTEM_PROMPT;

        if (userContext) {
            contextPrompt += '\n\nStudent Context:';
            if (userContext.weakTopics && userContext.weakTopics.length > 0) {
                contextPrompt += `\n- Weak topics: ${userContext.weakTopics.join(', ')}`;
            }
            if (userContext.recentSubjects && userContext.recentSubjects.length > 0) {
                contextPrompt += `\n- Recently studying: ${userContext.recentSubjects.join(', ')}`;
            }
            if (userContext.level) {
                contextPrompt += `\n- Current level: ${userContext.level}`;
            }
        }

        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: contextPrompt }],
                },
                {
                    role: 'model',
                    parts: [{ text: 'I understand. I\'m ready to help you with your learning journey. What would you like to know?' }],
                },
            ],
        });

        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error('AI Mentor Error:', error);
        throw new Error('Failed to generate AI response: ' + error.message);
    }
}

export async function generateDailyPlan(userContext: {
    weakTopics: string[];
    recentSubjects: string[];
    level: number;
}): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `As an AI Learning Mentor, create a personalized daily study plan for a student with the following profile:

- Weak topics: ${userContext.weakTopics.join(', ')}
- Recently studying: ${userContext.recentSubjects.join(', ')}
- Current level: ${userContext.level}

Provide a structured daily plan with:
1. Priority topics to focus on (2-3 topics)
2. Recommended study duration for each
3. Specific learning activities
4. Practice problems or exercises
5. Motivational tip

Format the response in a clear, actionable way.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error('Daily Plan Generation Error:', error);
        throw new Error('Failed to generate daily plan: ' + error.message);
    }
}
