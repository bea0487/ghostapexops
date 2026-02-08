import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia'
})

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: { message: 'Authentication required' } })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return res.status(401).json({ error: { message: 'Authentication required' } })
    }

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, tier, status, stripe_subscription_id')
      .eq('user_id', user.id)
      .single()

    if (clientError || !client) {
      return res.status(404).json({ error: { message: 'Client record not found' } })
    }

    let subscriptionDetails = null
    if (client.stripe_subscription_id) {
      try {
        const subscription = await stripe.subscriptions.retrieve(client.stripe_subscription_id)
        subscriptionDetails = {
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
        }
      } catch (stripeError) {
        console.error('Error fetching subscription from Stripe:', stripeError)
      }
    }

    return res.status(200).json({
      clientId: client.id,
      tier: client.tier,
      status: client.status,
      subscription: subscriptionDetails
    })
  } catch (error) {
    console.error('Error getting subscription status:', error)
    return res.status(500).json({
      error: { message: error.message || 'Failed to get subscription status' }
    })
  }
}
