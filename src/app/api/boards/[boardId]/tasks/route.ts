import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await params
  const tasks = await prisma.task.findMany({
    where: { boardId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ tasks })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await params
  const { title, description, assigneeId, priority } = await req.json()

  if (!title) {
    return NextResponse.json({ error: 'title required' }, { status: 400 })
  }

  const task = await prisma.task.create({
    data: {
      title,
      description: description || null,
      boardId,
      assigneeId: assigneeId || null,
      priority: priority || 'medium',
    },
  })

  return NextResponse.json({ task }, { status: 201 })
}
