import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const prisma = new PrismaClient({})

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data
  await prisma.chatMessage.deleteMany()
  await prisma.ticketMessage.deleteMany()
  await prisma.ticket.deleteMany()
  await prisma.riskScore.deleteMany()
  await prisma.aIInsight.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.bundle.deleteMany()
  await prisma.billingInformation.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.plan.deleteMany()
  await prisma.user.deleteMany()

  const hashedPassword = await bcrypt.hash('password123', 12)

  // Create users
  const admin = await prisma.user.create({
    data: { name: 'Admin User', email: 'admin@netpulse.com', password: hashedPassword, role: 'ADMIN' },
  })

  const employee = await prisma.user.create({
    data: { name: 'Sarah Mitchell', email: 'employee@netpulse.com', password: hashedPassword, role: 'EMPLOYEE' },
  })

  const customerUser = await prisma.user.create({
    data: { name: 'John Smith', email: 'customer@netpulse.com', password: hashedPassword, role: 'CUSTOMER' },
  })

  console.log('✅ Users created')

  // Create plans
  const basicPlan = await prisma.plan.create({
    data: {
      name: 'Basic',
      description: 'Perfect for light browsing and email',
      price: 29,
      speed: '50 Mbps',
      features: ['50 Mbps Download', '10 Mbps Upload', 'Email Support', '500GB Data Cap'].join(', '),
    },
  })

  const standardPlan = await prisma.plan.create({
    data: {
      name: 'Standard',
      description: 'Great for streaming and remote work',
      price: 49,
      speed: '100 Mbps',
      features: ['100 Mbps Download', '25 Mbps Upload', 'Priority Support', 'Unlimited Data'].join(', '),
    },
  })

  const premiumPlan = await prisma.plan.create({
    data: {
      name: 'Premium',
      description: 'Best for power users and businesses',
      price: 99,
      speed: '500 Mbps',
      features: ['500 Mbps Download', '100 Mbps Upload', '24/7 Dedicated Support', 'Unlimited Data', 'Static IP', 'Business SLA'].join(', '),
    },
  })

  console.log('✅ Plans created')

  // Create bundles
  const familyBundle = await prisma.bundle.create({
    data: {
      name: 'Family Bundle',
      description: 'Perfect for families with multiple connections',
      discount: 15,
      totalPrice: 109.99,
      plans: JSON.stringify([basicPlan.id, standardPlan.id]),
    },
  })

  const businessBundle = await prisma.bundle.create({
    data: {
      name: 'Business Bundle',
      description: 'Professional setup for small businesses',
      discount: 20,
      totalPrice: 179.99,
      plans: JSON.stringify([standardPlan.id, premiumPlan.id]),
    },
  })

  console.log('✅ Bundles created')

  // Create customers with their users
  const customerData = [
    { firstName: 'John', lastName: 'Smith', phone: '+1-555-0101', address: '123 Oak Street', city: 'Austin', userId: customerUser.id },
    { firstName: 'Emily', lastName: 'Johnson', phone: '+1-555-0102', address: '456 Maple Ave', city: 'Dallas' },
    { firstName: 'Michael', lastName: 'Williams', phone: '+1-555-0103', address: '789 Pine Road', city: 'Houston' },
    { firstName: 'Jessica', lastName: 'Brown', phone: '+1-555-0104', address: '321 Cedar Lane', city: 'San Antonio' },
    { firstName: 'David', lastName: 'Jones', phone: '+1-555-0105', address: '654 Birch Blvd', city: 'Austin' },
    { firstName: 'Sarah', lastName: 'Davis', phone: '+1-555-0106', address: '987 Elm Court', city: 'Dallas' },
    { firstName: 'James', lastName: 'Miller', phone: '+1-555-0107', address: '147 Walnut Dr', city: 'Houston' },
    { firstName: 'Ashley', lastName: 'Wilson', phone: '+1-555-0108', address: '258 Spruce Way', city: 'Austin', status: 'INACTIVE' as const },
    { firstName: 'Robert', lastName: 'Moore', phone: '+1-555-0109', address: '369 Cherry St', city: 'Dallas' },
    { firstName: 'Amanda', lastName: 'Taylor', phone: '+1-555-0110', address: '741 Ash Ave', city: 'San Antonio' },
    { firstName: 'Christopher', lastName: 'Anderson', phone: '+1-555-0111', address: '852 Poplar Rd', city: 'Houston' },
    { firstName: 'Jennifer', lastName: 'Thomas', phone: '+1-555-0112', address: '963 Willow Ln', city: 'Austin', status: 'INACTIVE' as const },
    { firstName: 'Daniel', lastName: 'Jackson', phone: '+1-555-0113', address: '159 Sycamore Ct', city: 'Dallas' },
    { firstName: 'Megan', lastName: 'White', phone: '+1-555-0114', address: '357 Hickory Dr', city: 'Houston' },
    { firstName: 'Matthew', lastName: 'Harris', phone: '+1-555-0115', address: '468 Redwood Ave', city: 'San Antonio' },
  ]

  const customers = []

  for (const data of customerData) {
    let userId = data.userId

    if (!userId) {
      const user = await prisma.user.create({
        data: {
          name: `${data.firstName} ${data.lastName}`,
          email: `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}@email.com`,
          password: hashedPassword,
          role: 'CUSTOMER',
        },
      })
      userId = user.id
    }

    const customer = await prisma.customer.create({
      data: {
        userId,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        status: data.status || 'ACTIVE',
      },
    })

    customers.push(customer)
  }

  console.log(`✅ ${customers.length} customers created`)

  // Assign subscriptions
  const plans = [basicPlan, standardPlan, premiumPlan]
  const bundles = [familyBundle, businessBundle]
  const now = new Date()

  for (let i = 0; i < customers.length; i++) {
    const plan = plans[i % 3]
    const startDate = new Date(now.getTime() - Math.random() * 180 * 24 * 60 * 60 * 1000) // Random start within 6 months
    const renewalDays = i % 4 === 0 ? 5 : 30
    const endDate = customers[i].status === 'INACTIVE'
      ? new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + renewalDays * 24 * 60 * 60 * 1000)

    const status = endDate < now ? 'EXPIRED' : 'ACTIVE'

    // 30% of customers get bundled subscriptions
    const bundleId = Math.random() > 0.7 ? bundles[i % bundles.length].id : undefined
    const dataCapGb = plan.name === 'Basic' ? 500 : plan.name === 'Standard' ? 1000 : 2000
    const dataUsedGb = i % 5 === 0
      ? dataCapGb
      : i % 3 === 0
        ? Math.round(dataCapGb * 0.55 * 10) / 10
        : Math.round(dataCapGb * (0.15 + Math.random() * 0.75) * 10) / 10

    await prisma.subscription.create({
      data: {
        customerId: customers[i].id,
        planId: plan.id,
        bundleId,
        status: status as 'ACTIVE' | 'EXPIRED',
        startDate,
        endDate,
        autoRenew: Math.random() > 0.2,
        dataCapGb,
        dataUsedGb: Math.min(dataUsedGb, dataCapGb),
      },
    })
  }

  console.log('✅ Subscriptions created')

  // Create billing information for each customer
  const paymentMethods = ['card', 'bank_transfer', 'check']
  const states = ['Texas', 'California', 'New York', 'Florida', 'Illinois']
  
  for (const customer of customers) {
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
    const state = states[Math.floor(Math.random() * states.length)]
    
    const billingData: any = {
      customerId: customer.id,
      billingAddress: customer.address,
      billingCity: customer.city,
      billingState: state,
      billingZipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
      billingCountry: 'United States',
      paymentMethod,
      isDefault: true,
    }
    
    if (paymentMethod === 'card') {
      billingData.cardHolderName = `${customer.firstName} ${customer.lastName}`
      billingData.cardLastFour = `${Math.floor(Math.random() * 9000) + 1000}`
      const month = Math.floor(Math.random() * 12) + 1
      const year = 25 + Math.floor(Math.random() * 5)
      billingData.cardExpiry = `${month.toString().padStart(2, '0')}/${year}`
    } else if (paymentMethod === 'bank_transfer') {
      billingData.bankAccountHolderName = `${customer.firstName} ${customer.lastName}`
      billingData.bankAccountLastFour = `${Math.floor(Math.random() * 9000) + 1000}`
      billingData.bankRoutingNumber = `${Math.floor(Math.random() * 900000000) + 100000000}`
    }
    
    // 20% chance of having a tax ID (business accounts)
    if (Math.random() > 0.8) {
      billingData.taxId = `${Math.floor(Math.random() * 90000000) + 10000000}`
      billingData.businessName = `${customer.lastName} Enterprises`
    }
    
    await prisma.billingInformation.create({ data: billingData })
  }

  console.log('✅ Billing information created')
  const invoiceStatuses = ['PAID', 'PAID', 'PAID', 'UNPAID', 'OVERDUE'] as const

  for (const customer of customers) {
    // Get customer's subscription to check if they have a bundle
    const subscription = await prisma.subscription.findFirst({
      where: { customerId: customer.id },
      include: { bundle: true },
    })

    for (let m = 0; m < 3; m++) {
      const plan = plans[customers.indexOf(customer) % 3]
      const dueDate = new Date(now.getTime() - m * 30 * 24 * 60 * 60 * 1000)
      const status = invoiceStatuses[Math.floor(Math.random() * invoiceStatuses.length)]
      
      // If customer has bundle subscription, use bundle price; otherwise use plan price
      const amount = subscription?.bundle ? subscription.bundle.totalPrice : plan.price
      const tax = amount * 0.08
      const description = subscription?.bundle 
        ? `Monthly Internet Service - ${subscription.bundle.name}`
        : `Monthly Internet Service - ${plan.name} Plan`

      const invoice = await prisma.invoice.create({
        data: {
          customerId: customer.id,
          bundleId: subscription?.bundleId,
          amount,
          tax,
          total: amount + tax,
          status,
          dueDate,
          description,
        },
      })

      if (status === 'PAID') {
        await prisma.payment.create({
          data: {
            invoiceId: invoice.id,
            amount: amount + tax,
            method: ['card', 'bank_transfer', 'paypal'][Math.floor(Math.random() * 3)],
            paidAt: new Date(dueDate.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000),
          },
        })
      }
    }
  }

  console.log('✅ Invoices and payments created')

  // Create tickets
  const ticketData = [
    { subject: 'Internet connection keeps dropping', description: 'My internet has been disconnecting every few hours for the past 3 days. I\'ve tried restarting the router but it keeps happening.', priority: 'HIGH', status: 'OPEN' },
    { subject: 'Slow download speeds', description: 'I\'m paying for 100 Mbps but only getting around 30 Mbps. This has been going on for a week.', priority: 'MEDIUM', status: 'IN_PROGRESS' },
    { subject: 'Billing discrepancy', description: 'I was charged $99 instead of $49 on my last invoice. Please correct this.', priority: 'HIGH', status: 'OPEN' },
    { subject: 'Want to upgrade my plan', description: 'I\'d like to upgrade from Basic to Premium. What\'s the process?', priority: 'LOW', status: 'CLOSED' },
    { subject: 'Router firmware update', description: 'My router shows a firmware update is available. Should I update it?', priority: 'LOW', status: 'CLOSED' },
    { subject: 'Cannot access certain websites', description: 'Some websites are not loading while others work fine. DNS issue maybe?', priority: 'MEDIUM', status: 'IN_PROGRESS' },
    { subject: 'Service outage in area', description: 'Multiple neighbors are also reporting internet outage. Is there a service disruption in the Austin area?', priority: 'URGENT', status: 'OPEN' },
    { subject: 'WiFi not reaching all rooms', description: 'The WiFi signal doesn\'t reach my upstairs rooms. Can I get a range extender?', priority: 'LOW', status: 'OPEN' },
  ]

  const customerUsers = await prisma.user.findMany({ where: { role: 'CUSTOMER' } })

  for (let i = 0; i < ticketData.length; i++) {
    const data = ticketData[i]
    const creator = customerUsers[i % customerUsers.length]

    const ticket = await prisma.ticket.create({
      data: {
        subject: data.subject,
        description: data.description,
        priority: data.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
        status: data.status as 'OPEN' | 'IN_PROGRESS' | 'CLOSED',
        creatorId: creator.id,
      },
    })

    // Add a reply to some tickets
    if (data.status !== 'OPEN') {
      await prisma.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          senderId: employee.id,
          content: 'Thank you for reaching out. We\'re looking into this issue and will get back to you shortly. In the meantime, please try restarting your equipment.',
        },
      })
    }
  }

  console.log('✅ Tickets created')

  // Create risk scores
  for (const customer of customers) {
    const score = Math.floor(Math.random() * 100)
    const level = score <= 33 ? 'LOW' : score <= 66 ? 'MEDIUM' : 'HIGH'
    const factors = []

    if (score > 50) factors.push('Late payment history')
    if (score > 60) factors.push('Support complaints')
    if (score > 70) factors.push('Inactive periods')
    if (score > 40 && Math.random() > 0.5) factors.push('Basic plan subscriber')
    if (factors.length === 0) factors.push('Good standing')

    await prisma.riskScore.create({
      data: {
        customerId: customer.id,
        score,
        level: level as 'LOW' | 'MEDIUM' | 'HIGH',
        factors: factors.join(', '),
      },
    })
  }

  console.log('✅ Risk scores created')

  // Create AI insights
  await prisma.aIInsight.createMany({
    data: [
      {
        type: 'revenue',
        title: 'Revenue Analysis & Forecast',
        content: 'Current monthly revenue is trending upward at $62,000. Based on subscriber growth patterns, projected revenue for next month is approximately $67,000 (+8%). The Premium plan contributes 45% of total revenue despite having only 26% of subscribers, making it the most profitable segment.',
      },
      {
        type: 'churn',
        title: 'Churn Risk Assessment',
        content: 'Currently 10% of customers are classified as high risk. Key churn indicators include: overdue payments (affecting 15% of base), inactive accounts (8%), and expired subscriptions. Recommended actions: implement automated payment reminders, offer retention discounts to high-risk customers, and proactive outreach to inactive accounts.',
      },
      {
        type: 'growth',
        title: 'Growth Opportunities',
        content: 'The Standard plan shows the highest conversion rate and customer satisfaction. Consider: 1) Introducing a family bundle with multi-connection discounts, 2) Launching a referral program targeting Standard plan users, 3) Creating a business-tier plan between Standard and Premium. Geographic analysis shows highest density in Austin - consider expanding marketing in Houston.',
      },
      {
        type: 'recommendation',
        title: 'Strategic Recommendations',
        content: '1) Automate invoice reminders 3 days before due date to reduce overdue payments by 40%\n2) Implement a loyalty program offering speed upgrades after 12 months\n3) Launch a self-service portal for common issues to reduce support tickets by 25%\n4) Consider seasonal promotions during Q1 when churn typically increases',
      },
    ],
  })

  console.log('✅ AI insights created')
  console.log('🎉 Seed complete!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
