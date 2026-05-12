const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Fixing customer balances...')
  
  const standardPlan = await prisma.plan.findUnique({ where: { name: 'Standard' } })
  if (!standardPlan) {
    console.error('Standard plan not found. Please run seed.js first.')
    return
  }

  const customers = await prisma.customer.findMany({
    include: { subscriptions: { where: { status: 'ACTIVE' } } }
  })

  console.log(`Found ${customers.length} customers.`)

  for (const customer of customers) {
    if (customer.subscriptions.length === 0) {
      console.log(`Creating subscription for customer ${customer.firstName} ${customer.lastName}...`)
      await prisma.subscription.create({
        data: {
          customerId: customer.id,
          planId: standardPlan.id,
          status: 'ACTIVE',
          dataCapGb: 500, // 500GB initial balance
          dataUsedGb: Math.random() * 200, // Random usage for realism
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        }
      })
    } else {
      console.log(`Customer ${customer.firstName} ${customer.lastName} already has an active subscription.`)
    }
  }

  console.log('Balance fix completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
