import { Ollama } from 'ollama';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    const ollama = new Ollama({ host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434' });
    const model = process.env.OLLAMA_MODEL || 'llama3';
    console.log(`Testing direct Ollama connection to ${process.env.OLLAMA_HOST || 'http://127.0.0.1:11434'} with model ${model}...`);
    try {
        const response = await ollama.chat({
            model: model,
            messages: [{ role: 'user', content: 'Say hello' }],
        });
        console.log('Ollama Response:', response.message.content);
    } catch (error) {
        console.error('Ollama Connection Failed:', error.message);
    }
}

test();
