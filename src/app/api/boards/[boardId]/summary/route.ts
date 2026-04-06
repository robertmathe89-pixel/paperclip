import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { user, response } = await requireAuth(req)
  if (response) return response

  const { boardId } = await params

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      tasks: {
        orderBy: { updatedAt: 'desc' },
      },
    },
  })

  if (!board) {
    return NextResponse.json({ error: 'Board not found' }, { status: 404 })
  }

  const team = await prisma.team.findFirst({
    where: {
      members: { some: { userId: user.userId } },
      boards: { some: { id: boardId } },
    },
  })

  if (!team) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const totalTasks = board.tasks.length
  const todoTasks = board.tasks.filter((t) => t.status === 'todo').length
  const inProgressTasks = board.tasks.filter((t) => t.status === 'in_progress').length
  const doneTasks = board.tasks.filter((t) => t.status === 'done').length

  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  const highPriorityOpen = board.tasks.filter(
    (t) => (t.priority === 'high' || t.priority === 'critical') && t.status !== 'done'
  )

  const recentCompleted = board.tasks
    .filter((t) => t.status === 'done')
    .slice(0, 5)
    .map((t) => t.title)

  const summary = generateSummary({
    boardName: board.name,
    totalTasks,
    todoTasks,
    inProgressTasks,
    doneTasks,
    completionRate,
    highPriorityOpen,
    recentCompleted,
  })

  return NextResponse.json({ summary })
}

function generateSummary(data: {
  boardName: string
  totalTasks: number
  todoTasks: number
  inProgressTasks: number
  doneTasks: number
  completionRate: number
  highPriorityOpen: { title: string; priority: string }[]
  recentCompleted: string[]
}): string {
  const lines: string[] = []

  lines.push(`## ${data.boardName} -- Weekly Summary`)
  lines.push('')
  lines.push(`**Overall:** ${data.completionRate}% complete (${data.doneTasks}/${data.totalTasks} tasks done)`)
  lines.push('')

  lines.push('### Status Breakdown')
  lines.push(`- To Do: ${data.todoTasks}`)
  lines.push(`- In Progress: ${data.inProgressTasks}`)
  lines.push(`- Done: ${data.doneTasks}`)
  lines.push('')

  if (data.highPriorityOpen.length > 0) {
    lines.push('### High Priority Items')
    data.highPriorityOpen.forEach((t) => {
      lines.push(`- [${t.priority.toUpperCase()}] ${t.title}`)
    })
    lines.push('')
  }

  if (data.recentCompleted.length > 0) {
    lines.push('### Recently Completed')
    data.recentCompleted.forEach((t) => {
      lines.push(`- ${t}`)
    })
    lines.push('')
  }

  if (data.completionRate >= 80) {
    lines.push('Great progress this week!')
  } else if (data.completionRate >= 50) {
    lines.push('Good momentum. Focus on clearing the remaining items.')
  } else if (data.inProgressTasks > data.doneTasks) {
    lines.push('Consider finishing in-progress items before starting new ones.')
  } else {
    lines.push('Time to pick up the pace!')
  }

  return lines.join('\n')
}
