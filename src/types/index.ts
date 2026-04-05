export interface User {
  id: string
  email: string
  name: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Team {
  id: string
  name: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  subscriptionStatus: 'free' | 'pro' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

export interface TeamMember {
  id: string
  role: 'admin' | 'member'
  userId: string
  teamId: string
  createdAt: Date
}

export interface Board {
  id: string
  name: string
  teamId: string
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assigneeId: string | null
  boardId: string
  createdAt: Date
  updatedAt: Date
}
