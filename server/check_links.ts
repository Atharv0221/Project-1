import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Checking Chapter Links...');
    const chapters = await prisma.chapter.findMany({
        select: { name: true, subject: { select: { name: true } }, youtubeLink: true },
    });
    console.log(JSON.stringify(chapters, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
