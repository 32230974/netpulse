const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Resetting data usage for all customers...')
  
  const subscriptions = await prisma.subscription.findMany({
    where: { status: 'ACTIVE' }
  })

  for (const sub of subscriptions) {
    const newDataUsed = sub.dataCapGb * 0.2 // Set usage to 20%
    console.log(`Resetting sub ${sub.id}: ${sub.dataUsedGb} -> ${newDataUsed}`)
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { dataUsedGb: newDataUsed }
    })
  }

  console.log('Usage reset completed!')
}

main().finally(() => prisma.$disconnect())
