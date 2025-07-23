import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of protected routes
const protectedRoutes = ['/publish', '/book', '/profile'];

// Helper to check if the pathname is protected
function isProtectedRoute(pathname: string) {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect certain routes
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  // Check for Firebase Auth session cookie
  const sessionCookie = request.cookies.get('__session');

  // If no session cookie, redirect to home
  if (!sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // Optionally: verify the session cookie with Firebase Admin SDK here for extra security
  // (requires backend setup, not shown here)

  return NextResponse.next();
}

// Specify the matcher for protected routes
export const config = {
  matcher: ['/publish/:path*', '/book/:path*', '/profile/:path*'],
}; 