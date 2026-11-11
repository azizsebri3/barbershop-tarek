import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ error: 'Please sign in with your username and password.' }, { status: 410 })
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return response
}
