import { NextRequest, NextResponse } from 'next/server';
// import { verifyToken } from '@/backend_lib/auth/auth.cookie';

export async function middleware(request: NextRequest) {
  const protectedPaths = [
     '/create-manga',
     '/profile']

  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  const token = request.cookies.get('token')

  if (isProtectedPath && !token) {
    const loginUrl = new URL('/login', request.url)
    // Add the original URL as a parameter to redirect back after login
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // if (process.env.NODE_ENV === 'production' && request.nextUrl.protocol !== 'https:') {
  //   return NextResponse.redirect(
  //     new URL(`https://${request.nextUrl.hostname}${request.nextUrl.pathname}`, request.url)
  //   );
  // }
  return NextResponse.next();
}

export const config = {
  matcher: ['/create-manga/:path*', '/'], // Apply middleware to all routes
};