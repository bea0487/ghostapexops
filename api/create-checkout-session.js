import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia'
})

const TIER_PRICES = {
  wingman: {
    name: 'The Wingman',
    price: 15000,
    description: 'Weekly compliance audits and essential support'
  },
  guardian: {
    name: 'The Guardian',
    price: 27500,
    description: 'Comprehensive compliance management with priority support'
  },
  apex_command: {
    name: 'Apex Command',
    price: 45000,
    description: 'Full-service compliance with dedicated account manager'
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { tier, successUrl, cancelUrl } = req.body

    if (!tier || !TIER_PRICES[tier]) {
      return res.status(400).json({ error: { message: 'Invalid service tier specified' } })
    }

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
      .select('id, company_name')
      .eq('user_id', user.id)
      .single()

    if (clientError || !client) {
      return res.status(404).json({ error: { message: 'Client record not found' } })
    }

    const tierConfig = TIER_PRICES[tier]

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: tierConfig.name,
              description: tierConfig.description,
            },
            unit_amount: tierConfig.price,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      customer_email: user.email,
      client_reference_id: client.id,
      metadata: {
        client_id: client.id,
        user_id: user.id,
        tier: tier,
        company_name: client.company_name
      },
      subscription_data: {
        metadata: {
          client_id: client.id,
          user_id: user.id,
          tier: tier
        },
        trial_period_days: 30,
      },
      success_url: successUrl || `${process.env.FRONTEND_URL || req.headers.origin}/portal/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL || req.headers.origin}/portal/checkout?tier=${tier}`,
    })

    return res.status(200).json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return res.status(500).json({
      error: { message: error.message || 'Failed to create checkout session' }
    })
  }
}
