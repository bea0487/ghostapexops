/**
 * Stripe Payment API
 * 
 * Handles Stripe checkout sessions and subscription management.
 * Integrates with Supabase for user and client management.
 * 
 * Security: All routes require authentication
 */

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia'
})

/**
 * Tier pricing configuration
 * Prices are in cents (USD)
 */
const TIER_PRICES = {
  wingman: {
    name: 'The Wingman',
    price: 15000, // $150.00
    description: 'Weekly compliance audits and essential support'
  },
  guardian: {
    name: 'The Guardian',
    price: 27500, // $275.00
    description: 'Comprehensive compliance management with priority support'
  },
  apex_command: {
    name: 'Apex Command',
    price: 45000, // $450.00
    description: 'Full-service compliance with dedicated account manager'
  }
}

/**
 * POST /api/create-checkout-session
 * Create a Stripe checkout session for subscription
 * 
 * @param {Object} body
 * @param {string} body.tier - Service tier (wingman, guardian, apex_command)
 * @param {string} body.successUrl - URL to redirect after successful payment
 * @param {string} body.cancelUrl - URL to redirect if payment is cancelled
 * @returns {Promise<Object>} - Checkout session data
 */
export async function createCheckoutSession(body) {
  try {
    const { tier, successUrl, cancelUrl } = body

    // Validate tier
    if (!tier || !TIER_PRICES[tier]) {
      return {
        error: {
          code: 'INVALID_TIER',
          message: 'Invalid service tier specified',
          status: 400
        }
      }
    }

    // Get current user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          status: 401
        }
      }
    }

    const userId = session.user.id
    const userEmail = session.user.email

    // Get client record
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, company_name')
      .eq('user_id', userId)
      .single()

    if (clientError || !client) {
      return {
        error: {
          code: 'CLIENT_NOT_FOUND',
          message: 'Client record not found',
          status: 404
        }
      }
    }

    const tierConfig = TIER_PRICES[tier]

    // Create Stripe checkout session
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
      customer_email: userEmail,
      client_reference_id: client.id,
      metadata: {
        client_id: client.id,
        user_id: userId,
        tier: tier,
        company_name: client.company_name
      },
      subscription_data: {
        metadata: {
          client_id: client.id,
          user_id: userId,
          tier: tier
        },
        trial_period_days: 30, // 30-day free trial
      },
      success_url: successUrl || `${process.env.FRONTEND_URL}/portal/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/portal/checkout?tier=${tier}`,
    })

    return {
      data: {
        sessionId: checkoutSession.id,
        url: checkoutSession.url
      },
      status: 200
    }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return {
      error: {
        code: 'STRIPE_ERROR',
        message: error.message || 'Failed to create checkout session',
        status: 500
      }
    }
  }
}

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 * 
 * @param {Object} body - Stripe event payload
 * @param {string} signature - Stripe signature header
 * @returns {Promise<Object>} - Success response
 */
export async function handleStripeWebhook(body, signature) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured')
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )

    // Handle different event types
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
        await handlePaymentSucceeded(event.data.object)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return {
      data: { received: true },
      status: 200
    }
  } catch (error) {
    console.error('Webhook error:', error)
    return {
      error: {
        code: 'WEBHOOK_ERROR',
        message: error.message || 'Webhook processing failed',
        status: 400
      }
    }
  }
}

/**
 * Handle successful checkout completion
 */
async function handleCheckoutCompleted(session) {
  const clientId = session.metadata.client_id
  const tier = session.metadata.tier

  // Update client status to active
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

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(subscription) {
  const clientId = subscription.metadata.client_id

  // Update client subscription status
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

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionDeleted(subscription) {
  const clientId = subscription.metadata.client_id

  // Update client status to inactive
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

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice) {
  // Log successful payment
  console.log('Payment succeeded for invoice:', invoice.id)
  
  // You can add additional logic here, such as:
  // - Sending confirmation emails
  // - Updating payment history
  // - Triggering analytics events
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice) {
  // Log failed payment
  console.error('Payment failed for invoice:', invoice.id)
  
  // You can add additional logic here, such as:
  // - Sending notification emails
  // - Updating client status
  // - Triggering retry logic
}

/**
 * GET /api/subscription/status
 * Get current subscription status for authenticated user
 * 
 * @returns {Promise<Object>} - Subscription status
 */
export async function getSubscriptionStatus() {
  try {
    // Get current user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          status: 401
        }
      }
    }

    // Get client record with subscription info
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, tier, status, stripe_subscription_id')
      .eq('user_id', session.user.id)
      .single()

    if (clientError || !client) {
      return {
        error: {
          code: 'CLIENT_NOT_FOUND',
          message: 'Client record not found',
          status: 404
        }
      }
    }

    // If client has a Stripe subscription, fetch details
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

    return {
      data: {
        clientId: client.id,
        tier: client.tier,
        status: client.status,
        subscription: subscriptionDetails
      },
      status: 200
    }
  } catch (error) {
    console.error('Error getting subscription status:', error)
    return {
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to get subscription status',
        status: 500
      }
    }
  }
}

/**
 * POST /api/subscription/cancel
 * Cancel current subscription
 * 
 * @returns {Promise<Object>} - Cancellation confirmation
 */
export async function cancelSubscription() {
  try {
    // Get current user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          status: 401
        }
      }
    }

    // Get client record
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('stripe_subscription_id')
      .eq('user_id', session.user.id)
      .single()

    if (clientError || !client || !client.stripe_subscription_id) {
      return {
        error: {
          code: 'NO_SUBSCRIPTION',
          message: 'No active subscription found',
          status: 404
        }
      }
    }

    // Cancel subscription at period end (don't cancel immediately)
    const subscription = await stripe.subscriptions.update(
      client.stripe_subscription_id,
      {
        cancel_at_period_end: true
      }
    )

    return {
      data: {
        message: 'Subscription will be cancelled at the end of the billing period',
        cancelAt: new Date(subscription.current_period_end * 1000)
      },
      status: 200
    }
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return {
      error: {
        code: 'STRIPE_ERROR',
        message: error.message || 'Failed to cancel subscription',
        status: 500
      }
    }
  }
}
