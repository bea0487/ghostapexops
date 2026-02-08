import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia'
})

export const config = {
  api: {
    bodyParser: false,
  },
}

async function buffer(readable) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const buf = await buffer(req)
  const sig = req.headers['stripe-signature']

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured')
    }

    const event = stripe.webhooks.constructEvent(buf, sig, webhookSecret)

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break

      case 'invoice.payment_succeeded':
        console.log('Payment succeeded for invoice:', event.data.object.id)
        break

      case 'invoice.payment_failed':
        console.error('Payment failed for invoice:', event.data.object.id)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return res.status(400).json({ error: error.message || 'Webhook processing failed' })
  }
}

async function handleCheckoutCompleted(session) {
  const clientId = session.metadata.client_id
  const tier = session.metadata.tier

  const { error } = await supabase
    .from('clients')
    .update({
      status: 'active',
      tier: tier,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription
    })
    .eq('id', clientId)

  if (error) {
    console.error('Error updating client after checkout:', error)
  }
}

async function handleSubscriptionUpdated(subscription) {
  const clientId = subscription.metadata.client_id

  const { error } = await supabase
    .from('clients')
    .update({
      stripe_subscription_id: subscription.id,
      status: subscription.status === 'active' ? 'active' : 'inactive'
    })
    .eq('id', clientId)

  if (error) {
    console.error('Error updating subscription:', error)
  }
}

async function handleSubscriptionDeleted(subscription) {
  const clientId = subscription.metadata.client_id

  const { error } = await supabase
    .from('clients')
    .update({
      status: 'inactive',
      stripe_subscription_id: null
    })
    .eq('id', clientId)

  if (error) {
    console.error('Error handling subscription deletion:', error)
  }
}
