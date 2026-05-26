// Vercel Serverless Function: /api/subscribe
// Captures email for lead generation before showing results

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, subscriptions, wishlistCount } = req.body

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Valid email required' })
  }

  // In production, send to your email service:
  // - Resend, SendGrid, ConvertKit, Mailchimp, etc.
  // For MVP, we'll store in Vercel KV or just log it

  const leadData = {
    email,
    subscriptions: subscriptions || [],
    wishlistCount: wishlistCount || 0,
    timestamp: new Date().toISOString(),
    source: 'gamesubcalc',
  }

  // If you have a webhook URL configured (e.g., Zapier, Make, or your own backend)
  const webhookUrl = process.env.LEAD_WEBHOOK_URL
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      })
    } catch {
      // Don't block the user if webhook fails
    }
  }

  // Log for Vercel's built-in logging (visible in dashboard)
  console.log('NEW_LEAD:', JSON.stringify(leadData))

  return res.status(200).json({ success: true })
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
