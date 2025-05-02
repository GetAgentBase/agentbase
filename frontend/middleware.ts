import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public paths that don't require authentication
const publicPaths = ['/login', '/setup', '/']; // Add root path to public paths

// Cookie keys for consistency
const TOKEN_KEY = 'auth_token';
const SETUP_COMPLETE_KEY = 'setup_complete';

// Function to check if request path matches any of the protected paths
function isProtectedPath(path: string): boolean {
  const protectedPathPrefixes = [
    '/dashboard',
    '/agents',
    '/tools',
    '/connectors',
    '/settings',
    '/api-keys',
  ];
  
  return protectedPathPrefixes.some(prefix => path.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Clone the URL to create a new response if needed
  const url = request.nextUrl.clone();
  
  console.log('Middleware running for path:', pathname);
  
  // Get auth token from cookie - use the same key as in tokenStorage.ts
  const token = request.cookies.get(TOKEN_KEY)?.value;
  console.log('Token found:', !!token);
  
  // Check setup status
  const setupCheckCookie = request.cookies.get(SETUP_COMPLETE_KEY)?.value;
  const setupComplete = setupCheckCookie === 'true';
  console.log('Setup complete:', setupComplete);
  
  // Root path (/) always goes to our diagnostic page
  if (pathname === '/') {
    // Allow access to the diagnostic page
    return NextResponse.next();
  }
  
  // Case 1: If setup is not complete and not on setup page, redirect to setup
  if (!setupComplete && pathname !== '/setup') {
    console.log('Redirecting to setup page');
    url.pathname = '/setup';
    return NextResponse.redirect(url);
  }
  
  // Case 2: If setup is complete but trying to access setup page, redirect to login or dashboard
  if (setupComplete && pathname === '/setup') {
    console.log('Setup complete, redirecting to login or dashboard');
    url.pathname = token ? '/dashboard' : '/login';
    return NextResponse.redirect(url);
  }
  
  // Case 3: If no token and trying to access protected routes, redirect to login
  if (!token && isProtectedPath(pathname)) {
    console.log('No token, redirecting to login');
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  
  // Case 4: If has token and trying to access login page, redirect to dashboard
  if (token && pathname === '/login') {
    console.log('Token found, redirecting to dashboard');
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  
  // Default: allow the request to continue
  console.log('Allowing request to continue');
  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (e.g. robots.txt, images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 