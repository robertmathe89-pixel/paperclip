import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { generateAccessToken, generateRefreshToken, COOKIE_OPTIONS } from '@/lib/jwt'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
        teams: {
          create: {
            team: {
              create: {
                name: `${name || email.split('@')[0]}'s Team`,
              },
            },
            role: 'admin',
          },
        },
      },
      include: {
        teams: {
          include: { team: true },
        },
      },
    })

    const team = user.teams[0]?.team

    const accessToken = generateAccessToken({ userId: user.id, email: user.email })
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email })

    const response = NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name }, team },
      { status: 201 }
    )

    response.cookies.set('access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 })
    response.cookies.set('refresh_token', refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 })

    return response
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
