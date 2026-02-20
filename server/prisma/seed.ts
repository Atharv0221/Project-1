import { PrismaClient } from '@prisma/client';
import { mathChaptersData } from './mathChapters.js';
import { scienceChaptersData } from './scienceChapters.js';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database with DETAILED usage...');

    // HELPER to create Levels and Questions
    async function createLevels(chapterId: string, levelsData: any[]) {
        for (const [index, lvl] of levelsData.entries()) {
            const level = await prisma.level.upsert({
                where: { chapterId_name: { chapterId: chapterId, name: lvl.name } },
                update: {},
                create: { name: lvl.name, order: index + 1, chapterId: chapterId }
            });

            console.log(`  - Level: ${lvl.name}`);

            // Delete existing questions for this level to ensure clean state with new structure
            await prisma.question.deleteMany({ where: { levelId: level.id } });

            for (const q of lvl.questions) {
                await prisma.question.create({
                    data: {
                        content: q.q,
                        options: JSON.stringify(q.op.map((text: string, i: number) => ({ id: i + 1, text }))),
                        correctOption: q.ans,
                        difficulty: q.diff,
                        explanation: q.r,
                        rightFeedback: q.r,
                        wrongFeedback: q.w,
                        levelId: level.id
                    }
                });
            }
        }
    }

    // --- MATHEMATICS (Standard 8) ---
    const mathSubject = await prisma.subject.upsert({
        where: { name_standard: { name: 'Mathematics', standard: '8' } },
        update: {},
        create: { name: 'Mathematics', standard: '8' }
    });

    console.log('Processing Mathematics...');

    for (const ch of mathChaptersData) {
        console.log(`Chapter: ${ch.name}`);
        const chapter = await prisma.chapter.upsert({
            where: { subjectId_name: { subjectId: mathSubject.id, name: ch.name } },
            update: { youtubeLink: ch.youtubeLink },
            create: { name: ch.name, subjectId: mathSubject.id, order: ch.order, youtubeLink: ch.youtubeLink }
        });
        await createLevels(chapter.id, ch.levels);
    }

    // --- SCIENCE (Standard 8) ---
    const scienceSubject = await prisma.subject.upsert({
        where: { name_standard: { name: 'Science', standard: '8' } },
        update: {},
        create: { name: 'Science', standard: '8' }
    });

    console.log('Processing Science...');

    for (const ch of scienceChaptersData) {
        console.log(`Chapter: ${ch.name}`);
        const chapter = await prisma.chapter.upsert({
            where: { subjectId_name: { subjectId: scienceSubject.id, name: ch.name } },
            update: { youtubeLink: ch.youtubeLink },
            create: { name: ch.name, subjectId: scienceSubject.id, order: ch.order, youtubeLink: ch.youtubeLink }
        });
        await createLevels(chapter.id, ch.levels);
    }

    // --- STANDARD 9 & 10 (Placeholders) ---
    const standards = ['9', '10'];
    const subjects = ['Mathematics', 'Science'];

    for (const std of standards) {
        console.log(`Processing Standard ${std}...`);
        for (const subjName of subjects) {
            const subject = await prisma.subject.upsert({
                where: { name_standard: { name: subjName, standard: std } },
                update: {},
                create: { name: subjName, standard: std }
            });

            // Create one placeholder chapter
            const chapter = await prisma.chapter.upsert({
                where: { subjectId_name: { subjectId: subject.id, name: `${subjName} - ${std}th Grade Intro` } },
                update: {},
                create: { name: `${subjName} - ${std}th Grade Intro`, subjectId: subject.id, order: 1 }
            });

            // Create placeholder levels
            const levelsData = [
                {
                    name: 'Diagnostic',
                    questions: [
                        { q: `Placeholder question 1 for ${subjName} ${std}`, op: ['Option A', 'Option B', 'Option C', 'Option D'], ans: 1, diff: 'EASY', r: 'Correct!', w: 'Incorrect.' },
                        { q: `Placeholder question 2 for ${subjName} ${std}`, op: ['Option A', 'Option B', 'Option C', 'Option D'], ans: 2, diff: 'EASY', r: 'Correct!', w: 'Incorrect.' },
                        { q: `Placeholder question 3 for ${subjName} ${std}`, op: ['Option A', 'Option B', 'Option C', 'Option D'], ans: 3, diff: 'EASY', r: 'Correct!', w: 'Incorrect.' },
                        { q: `Placeholder question 4 for ${subjName} ${std}`, op: ['Option A', 'Option B', 'Option C', 'Option D'], ans: 4, diff: 'EASY', r: 'Correct!', w: 'Incorrect.' },
                        { q: `Placeholder question 5 for ${subjName} ${std}`, op: ['Option A', 'Option B', 'Option C', 'Option D'], ans: 1, diff: 'EASY', r: 'Correct!', w: 'Incorrect.' },
                    ]
                }
            ];
            await createLevels(chapter.id, levelsData);
        }
    }

    console.log('Seeding completed successfully.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
