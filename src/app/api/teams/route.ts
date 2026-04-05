import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'

export async function GET(req: NextRequest) {
  const { user, response } = await requireAuth(req)
  if (response) return response

  const memberships = await prisma.teamMember.findMany({
    where: { userId: user.userId },
    include: { team: true },
  })

  const teams = memberships.map(m => m.team)
  return NextResponse.json({ teams })
}

export async function POST(req: NextRequest) {
  const { user, response } = await requireAuth(req)
  if (response) return response

  const { name } = await req.json()
  if (!name) {
    return NextResponse.json({ error: 'name required' }, { status: 400 })
  }

  const team = await prisma.team.create({
    data: {
      name,
      members: {
        create: { userId: user.userId, role: 'admin' },
      },
    },
  })

  return NextResponse.json({ team }, { status: 201 })
}
