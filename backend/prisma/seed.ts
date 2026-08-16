import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const labels = ['Research', 'Design', 'Development', 'Testing', 'Deployment'];
  for (const name of labels) {
    await prisma.label.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('Seeded labels:', labels.join(', '));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
