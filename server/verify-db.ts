import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- Database Verification (yatsya_db) ---');
    console.log('Subjects:', await prisma.subject.count());
    console.log('Chapters:', await prisma.chapter.count());
    console.log('Questions:', await prisma.question.count());
    console.log('---------------------------');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
