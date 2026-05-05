const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const now = new Date()
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
  
  const sub = await prisma.subscription.findFirst({
    where: { status: 'ACTIVE' }
  })
  
  if (sub) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { endDate: threeDaysFromNow }
    })
    console.log(`Updated subscription ${sub.id} to end on ${threeDaysFromNow}`)
  } else {
    console.log('No active subscription found to update')
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
