import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { CreditCard, Shield, Check, ArrowLeft } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

const Checkout = () => {
  const [searchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  
  const tier = searchParams.get('tier') || 'wingman'

  const tierDetails = {
    wingman: {
      name: 'The Wingman',
      price: 150,
      features: [
        'Weekly compliance audits',
        'Support ticket system',
        'ELD report management',
        'Dispatch board access'
      ]
    },
    guardian: {
      name: 'The Guardian',
      price: 275,
      features: [
        'Everything in Wingman',
        'IFTA reporting',
        'Driver file management',
        'Priority support',
        'Monthly compliance reports'
      ]
    },
    apex_command: {
      name: 'Apex Command',
      price: 450,
      features: [
        'Everything in Guardian',
        'CSA score monitoring',
        'DataQ dispute management',
        'Dedicated account manager',
        '24/7 emergency support'
      ]
    }
  }

  const selectedTier = tierDetails[tier] || tierDetails.wingman

  const handleCheckout = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Call backend API to create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier,
          successUrl: `${window.location.origin}/portal/checkout/success`,
          cancelUrl: `${window.location.origin}/portal/checkout?tier=${tier}`
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }
    } catch (err) {
      setError(err.message || 'Failed to process checkout')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-12">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-4xl">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Plan Details */}
          <div className="bg-[#0d0d14] border border-cyan-500/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-2">{selectedTier.name}</h2>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold text-cyan-400">${selectedTier.price}</span>
              <span className="text-gray-400">/month</span>
            </div>

            <div className="space-y-3 mb-8">
              {selectedTier.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-cyan-500/20">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Shield size={16} className="text-cyan-400" />
                <span>Secure payment powered by Stripe</span>
              </div>
              <p className="text-gray-500 text-xs">
                Your payment information is encrypted and secure. Cancel anytime.
              </p>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="bg-[#0d0d14] border border-cyan-500/20 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center">
                <CreditCard className="text-black" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Complete Payment</h3>
                <p className="text-gray-400 text-sm">Secure checkout with Stripe</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-[#0a0a0f] border border-cyan-500/30 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Subscription</span>
                  <span className="text-white font-semibold">{selectedTier.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Monthly charge</span>
                  <span className="text-cyan-400 font-bold text-lg">${selectedTier.price}</span>
                </div>
              </div>

              <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
                <p className="text-gray-300 text-sm">
                  <strong className="text-cyan-400">First month free trial!</strong> You won't be charged until your trial ends. Cancel anytime during the trial period.
                </p>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-bold py-4 rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                'Processing...'
              ) : (
                <>
                  <CreditCard size={20} />
                  Proceed to Secure Checkout
                </>
              )}
            </button>

            <p className="text-center text-gray-500 text-xs mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
