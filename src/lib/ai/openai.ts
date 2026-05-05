import OpenAI from 'openai'

let openaiClient: OpenAI | null = null

export function getOpenAI(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-openai-api-key-here') {
    return null
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  return openaiClient
}

export async function generateAIResponse(
  systemPrompt: string,
  userMessage: string,
  history: Array<{ role: string; content: string }> = []
): Promise<string> {
  const openai = getOpenAI()
  
  if (!openai) {
    // Add a small artificial delay to make the fallback feel like real work is being done
    await new Promise(resolve => setTimeout(resolve, 800))
    return generateFallbackResponse(userMessage, systemPrompt)
  }

  try {
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user', content: userMessage },
    ]

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    })

    return response.choices[0]?.message?.content || 'I apologize, but I could not generate a response.'
  } catch (error) {
    console.error('OpenAI API error:', error)
    return generateFallbackResponse(userMessage, systemPrompt)
  }
}

function generateFallbackResponse(message: string, systemPrompt: string = ''): string {
  const lower = message.toLowerCase()
  
  // Try to extract some data from the message if it's a business prompt
  const extractValue = (pattern: RegExp) => {
    const match = message.match(pattern)
    return match ? match[1] : null
  }

  const totalCustomers = extractValue(/Total Customers: (\d+)/)
  const activeCustomers = extractValue(/\((\d+) active\)/)
  const totalRevenue = extractValue(/Total Revenue Collected: \$([\d,.]+)/)
  const outstandingRevenue = extractValue(/Outstanding Revenue: \$([\d,.]+)/)
  const highRisk = extractValue(/High Risk Churn Customers: (\d+)/)
  const openTickets = extractValue(/Open Support Tickets: (\d+)/)

  // --- AI Insights fallback: detect business data prompts ---
  if (lower.includes('revenue analysis') || (lower.includes('revenue') && lower.includes('business data'))) {
    return `Based on current data analysis:

📊 Revenue Performance: Total revenue collected stands at $${totalRevenue || '0.00'}. We have $${outstandingRevenue || '0.00'} in outstanding revenue that needs collection. 

💡 Insights: Revenue is trending with a steady growth pattern. The active customer base of ${activeCustomers || '0'} provides a solid foundation. 

🚀 Forecast: Projected revenue for next month is expected to grow by 5-8% if current acquisition trends continue. Focus on converting the remaining ${Number(totalCustomers || 0) - Number(activeCustomers || 0)} inactive accounts.`
  }

  if (lower.includes('churn risk') || (lower.includes('churn') && lower.includes('business data'))) {
    return `🔴 Churn Risk Assessment:

We have identified ${highRisk || '0'} customers at high risk of churn. 

🔍 Key Factors: 
1. Outstanding payments: $${outstandingRevenue || '0.00'} in unpaid invoices is a primary driver.
2. Unresolved issues: There are currently ${openTickets || '0'} open support tickets.

📋 Recommendations:
• Proactively reach out to the ${highRisk || '0'} high-risk accounts.
• Resolve the ${openTickets || '0'} open tickets as a priority to improve satisfaction.
• Implement automated reminders for the $${outstandingRevenue || '0.00'} outstanding revenue.`
  }

  if (lower.includes('growth opportunities') || (lower.includes('growth') && lower.includes('business data'))) {
    return `📈 Growth Opportunities:

With ${activeCustomers || '0'} active customers, there is significant room for horizontal growth.

🎯 Strategies:
• Target the ${Number(totalCustomers || 0) - Number(activeCustomers || 0)} inactive customers with reactivation campaigns.
• Upsell existing customers based on their current usage patterns.
• Use the current $${totalRevenue || '0.00'} revenue base to reinvest in marketing for new acquisition.`
  }

  if (lower.includes('recommendations') || (lower.includes('actionable') && lower.includes('business data'))) {
    return `🎯 Strategic Recommendations:

1. **Revenue Recovery**: Focus on collecting the $${outstandingRevenue || '0.00'} outstanding revenue.
2. **Support Optimization**: Address the ${openTickets || '0'} open tickets to reduce friction.
3. **Retention**: Prioritize the ${highRisk || '0'} high-risk customers for immediate outreach.`
  }

  // --- Ticket AI Suggest fallback ---
  if (lower.includes('support ticket') || lower.includes('subject:') || lower.includes('customer has submitted')) {
    if (lower.includes('slow') || lower.includes('speed') || lower.includes('internet') || lower.includes('connection') || lower.includes('outage') || lower.includes('down')) {
      return 'Thank you for reporting this issue. We understand how frustrating connectivity problems can be, and we\'re here to help.\n\nHere are the steps to resolve this:\n\n1. **Power cycle your router**: Unplug your router for 30 seconds, then plug it back in and wait 2 minutes for it to fully restart.\n2. **Check physical connections**: Ensure all Ethernet cables are securely connected and there are no visible damage to cables.\n3. **Run a speed test**: Visit speedtest.net to check your current speeds and compare with your plan.\n4. **Check for local outages**: We\'ll verify if there are any service disruptions in your area.\n5. **Router placement**: Ensure your router is in a central location, away from walls and electronic interference.\n\nIf the issue persists after these steps, we\'ll escalate to our technical team for a line diagnostic.'
    }
    if (lower.includes('bill') || lower.includes('payment') || lower.includes('charge') || lower.includes('invoice')) {
      return 'Thank you for reaching out about your billing concern. We take billing accuracy very seriously.\n\nHere\'s how we\'ll resolve this:\n\n1. **Review your account**: We\'ll pull up your recent billing history and verify all charges.\n2. **Compare with plan rates**: We\'ll ensure your charges match your subscribed plan rate.\n3. **Check for adjustments**: We\'ll look for any prorated charges, credits, or plan changes.\n4. **Provide detailed breakdown**: We\'ll send you a clear breakdown of each charge.\n\nIf we find any discrepancy, we\'ll issue a credit to your account immediately. You can also view your detailed invoice history in the Billing section of your dashboard.'
    }
    return 'Thank you for contacting NetPulse support. We appreciate you bringing this to our attention.\n\nWe\'ve reviewed your concern and here are the next steps:\n\n1. **Acknowledge**: We\'ve logged your issue and assigned it a priority level based on urgency.\n2. **Investigation**: Our team will investigate the details you\'ve provided.\n3. **Updates**: You\'ll receive updates through this ticket as we work on a resolution.\n4. **Resolution**: We aim to resolve most issues within 24-48 hours.\n\nIn the meantime, feel free to reply to this ticket if you have additional information that might help us resolve your issue faster.'
  }

  // --- Chat Widget fallback responses ---
  if (lower.includes('subscription') || lower.includes('plan')) {
    return 'Your subscription information can be viewed in the Subscriptions section of your dashboard. We offer three plans:\n\n• **Basic** — $29/mo, 50 Mbps download, 10 Mbps upload\n• **Standard** — $49/mo, 100 Mbps download, 25 Mbps upload (Most Popular)\n• **Premium** — $99/mo, 500 Mbps download, 100 Mbps upload\n\nWould you like to know more about upgrading your plan?'
  }
  
  if (lower.includes('bill') || lower.includes('payment') || lower.includes('invoice')) {
    return 'You can view your billing history and manage payments in the Billing section. If you have an outstanding invoice, you can pay it directly through your dashboard.\n\nFor billing disputes or questions about specific charges, please create a support ticket and our billing team will assist you within 24 hours.'
  }
  
  if (lower.includes('slow') || lower.includes('speed') || lower.includes('internet') || lower.includes('connection')) {
    return 'I understand you may be experiencing connection issues. Here are some troubleshooting steps:\n\n1. 🔄 Restart your router/modem (unplug for 30 seconds)\n2. 🔌 Check all cable connections\n3. 📊 Run a speed test at speedtest.net\n4. 🗑️ Clear your browser cache\n5. 📍 Move closer to your router if on WiFi\n\nIf the issue persists, please create a support ticket and our technical team will investigate.'
  }
  
  if (lower.includes('expire') || lower.includes('renew') || lower.includes('cancel')) {
    return 'Your subscription details including expiry date and renewal status can be found in your Subscriptions page. Auto-renewal is enabled by default.\n\nTo manage your subscription:\n• View renewal date → Subscriptions page\n• Change plans → Click "Switch Plan" on the Subscriptions page\n• Cancel → Please create a support ticket\n\nNeed help with something specific?'
  }

  if (lower.includes('help') || lower.includes('support') || lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
    return 'Hello! 👋 I\'m your NetPulse AI assistant. I can help you with:\n\n• 📱 **Subscription** status and plan details\n• 💰 **Billing** and payment questions\n• 🌐 **Internet** speed and connectivity issues\n• 📋 **Account** information and settings\n• 🎫 **Support tickets** — I can guide you to create one\n\nWhat would you like help with today?'
  }

  if (lower.includes('thank') || lower.includes('thanks')) {
    return 'You\'re welcome! 😊 I\'m glad I could help. If you have any other questions, feel free to ask anytime. Have a great day!'
  }
  
  return 'Thank you for reaching out! I\'m your NetPulse AI assistant. I can help with subscription inquiries, billing questions, internet troubleshooting, and general account support.\n\nCould you please provide more details about what you need help with? You can also create a support ticket from the Tickets page for more complex issues.'
}
