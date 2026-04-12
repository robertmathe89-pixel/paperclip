import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder')

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig || '',
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
    )

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const teamId = session.metadata?.teamId
        if (teamId) {
          await prisma.team.update({
            where: { id: teamId },
            data: {
              subscriptionStatus: 'pro',
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
            },
          })
        }
        break
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        await prisma.team.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { subscriptionStatus: 'cancelled' },
        })
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 400 }
    )
  }
}
