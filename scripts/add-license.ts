import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addLicense() {
  try {
    // First, check if the tenant exists
    const tenant = await prisma.tenant_master.findUnique({
      where: { tenant_id: 'TEN001' },
    });

    if (!tenant) {
      console.error('Tenant not found. Please create the tenant first.');
      return;
    }

    // Add a license for the tenant (valid for 1 year from now)
    const validFrom = new Date();
    const validTo = new Date();
    validTo.setFullYear(validTo.getFullYear() + 1);

    const license = await prisma.license.create({
      data: {
        license_id: `LIC${Date.now().toString().slice(-6)}`,
        license_type: 'PREMIUM',
        valid_from: validFrom,
        valid_to: validTo,
        tenant_id: 'TEN001',
        eligible_for_license: 'Yes',
      },
    });

    console.log('License created successfully:');
    console.log(JSON.stringify(license, null, 2));
  } catch (error) {
    console.error('Error creating license:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addLicense();
