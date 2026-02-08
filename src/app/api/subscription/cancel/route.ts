import { NextRequest, NextResponse } from 'next/server'
import { cancelSubscription } from '@/api/stripe'

export async function POST(request: NextRequest) {
  try {
    const result = await cancelSubscription()

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error.status || 500 }
      )
    }

    return NextResponse.json(result.data, { status: result.status || 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: { message: error.message || 'Internal server error' } },
      { status: 500 }
    )
  }
}
