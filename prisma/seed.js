const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding data bundles...')
  
  const bundles = [
    { name: 'Starter Pack', description: 'Perfect for light browsing and social media.', dataGb: 10, price: 5.0, isActive: true },
    { name: 'Daily Booster', description: 'Extra data for your heavy usage days.', dataGb: 25, price: 10.0, isActive: true },
    { name: 'Mega Streamer', description: 'Binge-watch your favorite shows without worry.', dataGb: 100, price: 35.0, isActive: true },
    { name: 'Power User', description: 'Maximum data for professional and gaming needs.', dataGb: 250, price: 75.0, isActive: true },
  ]

  for (const bundle of bundles) {
    await prisma.dataBundle.upsert({
      where: { name: bundle.name },
      update: {},
      create: bundle,
    })
  }

  console.log('Seeding plans...')
  const plans = [
    { name: 'Basic', speed: '50 Mbps', price: 29.99, description: 'Affordable internet for basic home use.', features: '["24/7 Support", "Unlimited Local Data"]', isActive: true },
    { name: 'Standard', speed: '200 Mbps', price: 49.99, description: 'High-speed internet for families and streaming.', features: '["24/7 Support", "Unlimited Local Data", "HD Streaming"]', isActive: true },
    { name: 'Premium', speed: '1 Gbps', price: 89.99, description: 'Ultra-fast fiber internet for professionals.', features: '["24/7 Support", "Unlimited Local Data", "4K Streaming", "Priority Routing"]', isActive: true },
  ]

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: {},
      create: plan,
    })
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
