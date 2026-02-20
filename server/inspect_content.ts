
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspectContent() {
    console.log('Inspecting content...');

    const subjects = await prisma.subject.findMany({
        include: {
            chapters: true
        }
    });

    for (const subject of subjects) {
        console.log(`Subject: ${subject.name} (Standard: ${subject.standard}, ID: ${subject.id})`);
        console.log(`  Chapter Count: ${subject.chapters.length}`);
        subject.chapters.forEach(c => {
            console.log(`    - "${c.name}" (ID: ${c.id})`);
        });
    }
}

inspectContent()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
