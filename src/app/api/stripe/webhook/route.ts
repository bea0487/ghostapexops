import { NextRequest, NextResponse } from 'next/server'
import { handleStripeWebhook } from '@/api/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: { message: 'Missing stripe-signature header' } },
        { status: 400 }
      )
    }

    const result = await handleStripeWebhook(body, signature)

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error.status || 500 }
      )
    }

    return NextResponse.json(result.data, { status: result.status || 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: { message: error.message || 'Webhook processing failed' } },
      { status: 400 }
    )
  }
}
