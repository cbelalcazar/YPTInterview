import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Cleaning up existing data...')
  await prisma.kPIEstimate.deleteMany({})
  await prisma.kPI.deleteMany({})
  await prisma.retailer.deleteMany({})
  await prisma.company.deleteMany({})

  console.log('Seeding baseline...')
  const KPI_GMV = 'GMV';
  const KPI_UNITS = 'Units Sold';
  const KPI_ASP = 'ASP';

  const shoeBrand = await prisma.company.create({
    data: {
      name: 'Trendy Shoe Brand',
      sector: 'Footwear',
    },
  })

  const gmv = await prisma.kPI.create({
    data: {
      name: KPI_GMV,
      format: 'CURRENCY',
    },
  })

  const units = await prisma.kPI.create({
    data: {
      name: KPI_UNITS,
      format: 'NUMBER',
    },
  })

  const asp = await prisma.kPI.create({
    data: {
      name: KPI_ASP,
      format: 'CURRENCY',
    },
  })

  const soleCity = await prisma.retailer.create({
    data: {
      name: 'Sole City',
    },
  })

  const mayPeriod = new Date('2025-05-01')
  await prisma.kPIEstimate.create({
    data: { companyId: shoeBrand.id, kpiId: gmv.id, retailerId: soleCity.id, period: mayPeriod, value: 671418737.93, isMtd: false },
  })
  await prisma.kPIEstimate.create({
    data: { companyId: shoeBrand.id, kpiId: units.id, retailerId: soleCity.id, period: mayPeriod, value: 11284624, isMtd: false },
  })
  await prisma.kPIEstimate.create({
    data: { companyId: shoeBrand.id, kpiId: asp.id, retailerId: soleCity.id, period: mayPeriod, value: 59.50, isMtd: false },
  })

  const junePeriod = new Date('2025-06-01')
  await prisma.kPIEstimate.create({
    data: { companyId: shoeBrand.id, kpiId: gmv.id, retailerId: soleCity.id, period: junePeriod, value: 661966121.81, isMtd: false },
  })
  await prisma.kPIEstimate.create({
    data: { companyId: shoeBrand.id, kpiId: units.id, retailerId: soleCity.id, period: junePeriod, value: 11349681, isMtd: false },
  })
  await prisma.kPIEstimate.create({
    data: { companyId: shoeBrand.id, kpiId: asp.id, retailerId: soleCity.id, period: junePeriod, value: 58.32, isMtd: false },
  })

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
