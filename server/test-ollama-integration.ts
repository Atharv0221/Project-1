import { generateMentorResponse } from './services/aiMentorService.js';

async function testOllama() {
    console.log('--- Testing Ollama Integration ---');
    try {
        const response = await generateMentorResponse('What is gravity?', { level: 9, subjects: ['Science'] });
        console.log('Mentor Response:', response);
        if (response.includes('resting') || response.includes('fallback')) {
            console.log('FAILED: Received fallback response.');
        } else {
            console.log('SUCCESS: Received valid response from AI.');
        }
    } catch (error) {
        console.error('ERROR during test:', error.message);
    }
}

testOllama();
