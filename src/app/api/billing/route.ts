import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-02-24.clover' as any,
})

export async function GET(req: NextRequest) {
  const { user, response } = await requireAuth(req)
  if (response) return response

  const teams = await prisma.team.findMany({
    where: {
      members: { some: { userId: user.userId } },
    },
    select: {
      id: true,
      name: true,
      subscriptionStatus: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
    },
  })

  return NextResponse.json({ teams })
}

export async function POST(req: NextRequest) {
  const { user, response } = await requireAuth(req)
  if (response) return response

  const { teamId } = await req.json()

  if (!teamId) {
    return NextResponse.json({ error: 'teamId required' }, { status: 400 })
  }

  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      members: { some: { userId: user.userId } },
    },
  })

  if (!team) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID || 'price_placeholder',
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/settings/billing?success=true`,
    cancel_url: `${baseUrl}/settings/billing?canceled=true`,
    metadata: {
      teamId: team.id,
    },
    customer: team.stripeCustomerId || undefined,
    subscription_data: {
      metadata: {
        teamId: team.id,
      },
    },
  })

  return NextResponse.json({ url: session.url })
}
