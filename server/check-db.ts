import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const userCount = await prisma.user.count();
    console.log(`Total users in database: ${userCount}`);

    const users = await prisma.user.findMany({
        select: {
            email: true,
            name: true,
            role: true
        }
    });

    console.log('User list:');
    console.table(users);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
