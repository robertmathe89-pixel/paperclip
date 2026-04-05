import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
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
  const { name, teamId, createdById } = await req.json()

  if (!name || !teamId || !createdById) {
    return NextResponse.json(
      { error: 'name, teamId, and createdById required' },
      { status: 400 }
    )
  }

  const board = await prisma.board.create({
    data: { name, teamId, createdById },
  })

  return NextResponse.json({ board }, { status: 201 })
}
