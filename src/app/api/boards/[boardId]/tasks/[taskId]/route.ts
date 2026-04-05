import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string; taskId: string }> }
) {
  const { taskId } = await params
  const data = await req.json()

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status && { status: data.status }),
      ...(data.priority && { priority: data.priority }),
      ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
    },
  })

  return NextResponse.json({ task })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string; taskId: string }> }
) {
  const { taskId } = await params
  await prisma.task.delete({ where: { id: taskId } })
  return NextResponse.json({ success: true })
}
