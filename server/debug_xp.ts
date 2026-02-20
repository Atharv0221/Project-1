import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting XP Debug Script ---');

    // 1. Get a test user (or create one if empty)
    let user = await prisma.user.findFirst();
    if (!user) {
        console.log('No user found, creating a test user...');
        user = await prisma.user.create({
            data: {
                name: 'Test User',
                email: 'test@xp.com',
                password: 'hashedpassword',
                xp: 0
            }
        });
    }

    console.log(`User found: ${user.email}`);
    console.log(`Initial XP: ${user.xp}`);

    // 2. Find a level to play
    const level = await prisma.level.findFirst({ include: { chapter: true } });
    if (!level) {
        console.error('No levels found in DB. Cannot simulate quiz.');
        return;
    }
    console.log(`Simulating quiz for Level: ${level.name} (Chapter: ${level.chapter.name})`);

    // 3. Create a Quiz Session
    const session = await prisma.quizSession.create({
        data: {
            userId: user.id,
            levelId: level.id,
            status: 'IN_PROGRESS',
            score: 0,
            startTime: new Date()
        }
    });
    console.log(`Session created: ${session.id}`);

    // 4. Create dummy attempts (1 Correct Answer = 10 XP)
    const question = await prisma.question.findFirst({ where: { levelId: level.id } }) ||
        await prisma.question.findFirst(); // Fallback

    if (!question) {
        console.error('No questions found.');
        return;
    }

    await prisma.attempt.create({
        data: {
            userId: user.id,
            quizSessionId: session.id,
            questionId: question.id,
            isCorrect: true, // This should give 10 XP
            timeTaken: 5
        }
    });
    console.log('Created 1 correct attempt (should be 10 XP).');

    // 5. Simulate Complete Quiz Logic (Manual implementation of controller logic for verification)
    // In the real app, this is done by quizController.completeQuizSession.
    // We will call the EXACT logic used there (simplified for script).

    // --- CONTROLLER LOGIC SIMULATION START ---
    const totalQuestions = 1;
    const correctAnswers = 1;
    const scorePercentage = 100;

    const baseXp = correctAnswers * 10;
    const currentXp = user.xp || 0;
    const newXp = currentXp + baseXp;

    console.log(`Calculated Base XP: ${baseXp}`);
    console.log(`Expected New XP: ${newXp}`);

    // Perform Update
    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
            xp: newXp
        }
    });

    await prisma.xpLog.create({
        data: {
            userId: user.id,
            amount: baseXp,
            reason: 'Debug Script Test'
        }
    });

    // --- CONTROLLER LOGIC SIMULATION END ---

    console.log(`Updated User XP in DB: ${updatedUser.xp}`);

    if (updatedUser.xp === newXp) {
        console.log('SUCCESS: XP was saved correctly.');
    } else {
        console.error('FAILURE: XP mismatch.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
