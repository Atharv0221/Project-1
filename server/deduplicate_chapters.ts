
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deduplicateChapters() {
    console.log('Checking for duplicate chapters...');

    const chapters = await prisma.chapter.findMany({
        include: {
            subject: true
        }
    });


    // Group chapters by normalized unique key
    const chapterGroups: Record<string, typeof chapters> = {};

    for (const chapter of chapters) {
        const normalizedName = chapter.name.toLowerCase().replace('&', 'and').replace(/\s+/g, ' ').trim();
        const uniqueKey = `${normalizedName}-${chapter.subjectId}`;

        if (!chapterGroups[uniqueKey]) {
            chapterGroups[uniqueKey] = [];
        }
        chapterGroups[uniqueKey].push(chapter);
    }

    // Process groups
    for (const [key, group] of Object.entries(chapterGroups)) {
        if (group.length > 1) {
            console.log(`Found duplicate group: ${key} (${group.length} chapters)`);

            // Keep the first one as primary
            const primary = group[0];
            const duplicates = group.slice(1);

            console.log(`  Keeping primary: ${primary.name} (${primary.id})`);


            for (const duplicate of duplicates) {
                console.log(`  Processing duplicate: ${duplicate.name} (${duplicate.id})`);

                // 1. Merge Levels
                const duplicateLevels = await prisma.level.findMany({ where: { chapterId: duplicate.id } });
                for (const level of duplicateLevels) {
                    const existingLevel = await prisma.level.findFirst({
                        where: { chapterId: primary.id, name: level.name }
                    });

                    if (existingLevel) {
                        console.log(`    Merging Level "${level.name}"...`);
                        await prisma.question.updateMany({ where: { levelId: level.id }, data: { levelId: existingLevel.id } });
                        await prisma.quizSession.updateMany({ where: { levelId: level.id }, data: { levelId: existingLevel.id } });
                        await prisma.level.delete({ where: { id: level.id } });
                    } else {
                        console.log(`    Moving Level "${level.name}"...`);
                        await prisma.level.update({ where: { id: level.id }, data: { chapterId: primary.id } });
                    }
                }

                // 2. Merge Subtopics
                const duplicateSubtopics = await prisma.subtopic.findMany({ where: { chapterId: duplicate.id } });
                for (const subtopic of duplicateSubtopics) {
                    const existingSubtopic = await prisma.subtopic.findFirst({
                        where: { chapterId: primary.id, name: subtopic.name }
                    });

                    if (existingSubtopic) {
                        console.log(`    Merging Subtopic "${subtopic.name}"...`);
                        await prisma.question.updateMany({ where: { subtopicId: subtopic.id }, data: { subtopicId: existingSubtopic.id } });
                        await prisma.masteryTracking.updateMany({ where: { subtopicId: subtopic.id }, data: { subtopicId: existingSubtopic.id } });
                        await prisma.subtopic.delete({ where: { id: subtopic.id } });
                    } else {
                        console.log(`    Moving Subtopic "${subtopic.name}"...`);
                        await prisma.subtopic.update({ where: { id: subtopic.id }, data: { chapterId: primary.id } });
                    }
                }

                // 3. Delete Duplicate Chapter
                try {
                    await prisma.chapter.delete({ where: { id: duplicate.id } });
                    console.log(`    Deleted duplicate chapter.`);
                } catch (error) {
                    console.error(`    Failed to delete duplicate chapter:`, error);
                }
            }
        }
    }

    console.log('Deduplication complete.');
}

deduplicateChapters()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
