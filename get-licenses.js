const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const licenses = await prisma.license.findMany({
      include: {
        tenant_master: {
          select: {
            name: true,
            email: true,
            tenant_id: true
          }
        }
      },
      orderBy: {
        valid_to: 'desc'
      }
    });
    console.log(JSON.stringify(licenses, null, 2));
  } catch (error) {
    console.error('Error fetching licenses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
