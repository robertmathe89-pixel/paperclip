import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, JWTPayload } from '@/lib/jwt'

export async function requireAuth(req: NextRequest): Promise<{ user: JWTPayload; response?: NextResponse }> {
  const accessToken = req.cookies.get('access_token')?.value

  if (!accessToken) {
    return { user: null as unknown as JWTPayload, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const payload = verifyToken(accessToken)
  if (!payload) {
    return { user: null as unknown as JWTPayload, response: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }) }
  }

  return { user: payload }
}
