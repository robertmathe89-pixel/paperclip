import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'

export async function GET(req: NextRequest) {
  const { user, response } = await requireAuth(req)
  if (response) return response

  const { searchParams } = new URL(req.url)
  const teamId = searchParams.get('teamId')

  if (!teamId) {
    return NextResponse.json({ error: 'teamId required' }, { status: 400 })
  }

  const boards = await prisma.board.findMany({
    where: { teamId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ boards })
}

export async function POST(req: NextRequest) {
  const { user, response } = await requireAuth(req)
  if (response) return response

  const { name, teamId } = await req.json()

  if (!name || !teamId) {
    return NextResponse.json(
      { error: 'name and teamId required' },
      { status: 400 }
    )
  }

  const board = await prisma.board.create({
    data: { name, teamId, createdById: user.userId },
  })

  return NextResponse.json({ board }, { status: 201 })
}
