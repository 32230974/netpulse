import prisma from '@/lib/prisma'

/**
 * Checks if a customer has crossed the 50% or 100% data usage threshold
 * and automatically sends a notification if they haven't received one
 * in the last 24 hours for that threshold.
 * 
 * Call this after any operation that changes dataUsedGb or dataCapGb.
 */
export async function checkAndSendUsageNotifications(
  subscriptionId: string
) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        customer: { include: { user: true } },
        plan: true,
      },
    })

    if (!subscription || subscription.dataCapGb <= 0) return

    const usagePercent = (subscription.dataUsedGb / subscription.dataCapGb) * 100
    const customerName = `${subscription.customer.firstName} ${subscription.customer.lastName}`
    const planName = subscription.plan.name
    const userId = subscription.customer.userId
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Check 100% threshold first (higher priority)
    if (usagePercent >= 100) {
      const existing = await prisma.notification.findFirst({
        where: {
          userId,
          title: 'Data Usage Alert - 100%',
          createdAt: { gte: oneDayAgo },
        },
      })

      if (!existing) {
        await prisma.notification.create({
          data: {
            userId,
            title: 'Data Usage Alert - 100%',
            message: `Hi ${customerName}, you have used all ${subscription.dataCapGb.toFixed(1)}GB of your data on your ${planName} plan. Please recharge your data to continue enjoying your internet service.`,
            type: 'error',
          },
        })
      }
    }
    // Check 50% threshold
    else if (usagePercent >= 50) {
      const existing = await prisma.notification.findFirst({
        where: {
          userId,
          title: 'Data Usage Alert - 50%',
          createdAt: { gte: oneDayAgo },
        },
      })

      if (!existing) {
        await prisma.notification.create({
          data: {
            userId,
            title: 'Data Usage Alert - 50%',
            message: `Hi ${customerName}, you have used ${subscription.dataUsedGb.toFixed(1)}GB of ${subscription.dataCapGb.toFixed(1)}GB on your ${planName} plan. You are now at 50% of your data allowance. Consider recharging soon!`,
            type: 'warning',
          },
        })
      }
    }
  } catch (error) {
    // Don't let notification failures break the main operation
    console.error('Failed to check/send usage notifications:', error)
  }
}
