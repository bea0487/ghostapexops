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
  if (req.method !== 'POST') {
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
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .single()

    if (clientError || !client || !client.stripe_subscription_id) {
      return res.status(404).json({ error: { message: 'No active subscription found' } })
    }

    const subscription = await stripe.subscriptions.update(
      client.stripe_subscription_id,
      {
        cancel_at_period_end: true
      }
    )

    return res.status(200).json({
      message: 'Subscription will be cancelled at the end of the billing period',
      cancelAt: new Date(subscription.current_period_end * 1000)
    })
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return res.status(500).json({
      error: { message: error.message || 'Failed to cancel subscription' }
    })
  }
}
