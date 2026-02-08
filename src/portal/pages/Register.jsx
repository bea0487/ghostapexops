import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, AlertCircle, ArrowLeft, User, Building } from 'lucide-react'
import { supabase } from '../supabaseClient'

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    contactName: '',
    tier: 'wingman'
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const tiers = [
    { value: 'wingman', label: 'The Wingman', price: '$150/month' },
    { value: 'guardian', label: 'The Guardian', price: '$275/month' },
    { value: 'apex_command', label: 'Apex Command', price: '$450/month' }
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      setIsLoading(false)
      return
    }

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            company_name: formData.companyName,
            contact_name: formData.contactName,
            role: 'client'
          }
        }
      })

      if (authError) throw authError

      // Create client record
      const { error: clientError } = await supabase
        .from('clients')
        .insert({
          user_id: authData.user.id,
          company_name: formData.companyName,
          contact_name: formData.contactName,
          contact_email: formData.email,
          tier: formData.tier,
          status: 'pending' // Pending until payment is completed
        })

      if (clientError) throw clientError

      // Redirect to Stripe checkout
      navigate(`/portal/checkout?tier=${formData.tier}`)
    } catch (err) {
      setError(err.message || 'Failed to create account')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to login link */}
        <Link 
          to="/portal/login" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          Back to Login
        </Link>

        {/* Registration Card */}
        <div className="bg-[#0d0d14] border border-cyan-500/20 rounded-2xl p-8 shadow-2xl shadow-cyan-500/5">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center mb-4">
              <span className="font-bold text-black text-xl">GR</span>
            </div>
            <h1 className="font-bold text-white text-xl">CREATE ACCOUNT</h1>
            <p className="text-gray-400 mt-2">Ghost Rider: Apex Operations</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {/* Company Name */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Company Name</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0a0a0f] border border-cyan-500/30 rounded-lg py-3 pl-11 pr-4 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  placeholder="Your Company LLC"
                />
              </div>
            </div>

            {/* Contact Name */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Contact Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0a0a0f] border border-cyan-500/30 rounded-lg py-3 pl-11 pr-4 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0a0a0f] border border-cyan-500/30 rounded-lg py-3 pl-11 pr-4 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full bg-[#0a0a0f] border border-cyan-500/30 rounded-lg py-3 pl-11 pr-4 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <p className="text-gray-500 text-xs mt-1">Minimum 8 characters</p>
            </div>

            {/* Confirm Password */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0a0a0f] border border-cyan-500/30 rounded-lg py-3 pl-11 pr-4 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Service Tier Selection */}
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">Select Service Tier</label>
              <div className="space-y-2">
                {tiers.map((tier) => (
                  <label
                    key={tier.value}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.tier === tier.value
                        ? 'border-cyan-400 bg-cyan-500/10'
                        : 'border-cyan-500/30 hover:border-cyan-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="tier"
                        value={tier.value}
                        checked={formData.tier === tier.value}
                        onChange={handleChange}
                        className="text-cyan-400"
                      />
                      <span className="text-white font-medium">{tier.label}</span>
                    </div>
                    <span className="text-cyan-400 font-semibold">{tier.price}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Continue to Payment'}
            </button>

            <p className="text-center text-gray-400 text-sm mt-4">
              Already have an account?{' '}
              <Link to="/portal/login" className="text-cyan-400 hover:text-cyan-300">
                Sign In
              </Link>
            </p>
          </form>
        </div>

        {/* Help text */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Need help? Contact us at{' '}
          <a href="mailto:ghostrider.apexops@zohomail.com" className="text-cyan-400 hover:text-cyan-300">
            ghostrider.apexops@zohomail.com
          </a>
        </p>
      </div>
    </div>
  )
}

export default Register
