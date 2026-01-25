// src/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * English: Next.js 16 Proxy function.
 * This handles route protection by checking the 'refresh_token' cookie.
 */
export function proxy(request: NextRequest) {
  // English: We use 'refresh_token' because that is what your Safari logs showed
  const token = request.cookies.get('refresh_token')?.value;
  const { pathname } = request.nextUrl;

  // English: If no token exists and user tries to enter dashboard, send them to login
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // English: If token exists and user tries to enter auth pages, send them to dashboard
  if (token && pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// English: Configuration to match specific routes
export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
};
