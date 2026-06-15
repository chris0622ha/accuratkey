import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const ua = request.headers.get('user-agent') || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  
  // Allow auth pages always
  const path = request.nextUrl.pathname;
  const allowedOnMobile = ['/signin', '/login', '/signup', '/register', '/auth'];
  const isAllowed = allowedOnMobile.some(p => path === p || path.startsWith(p + '/'));
  
  if (isMobile && !isAllowed) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
