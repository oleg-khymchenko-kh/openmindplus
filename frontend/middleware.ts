import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin')
  const isLoginPath = request.nextUrl.pathname === '/admin/login'

  // Redirect to login if no token on admin pages (except login itself)
  if (isAdminPath && !isLoginPath && !token) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Redirect to dashboard if already logged in and visiting login
  if (isLoginPath && token) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
