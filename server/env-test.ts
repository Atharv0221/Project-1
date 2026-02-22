import dotenv from 'dotenv';
import path from 'path';

const result = dotenv.config();
console.log('Dotenv result:', result);
console.log('CWD:', process.cwd());
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
