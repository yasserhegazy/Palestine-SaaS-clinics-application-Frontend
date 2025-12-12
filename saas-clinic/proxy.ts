import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define role-based route access rules
const ROUTE_PERMISSIONS = {
  '/patient': ['Patient'],
  '/clinic': ['Manager'],
  '/doctor': ['Doctor'],
  '/reception': ['Secretary'],
  '/platform': ['platform_admin'],
} as const;

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/login', '/join-us', '/api'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow 403 page
  if (pathname === '/403') {
    return NextResponse.next();
  }

  // Get auth data from cookies
  const authToken = request.cookies.get('auth_token')?.value;
  const userDataCookie = request.cookies.get('user_data')?.value;

  // Redirect to login if not authenticated
  if (!authToken || !userDataCookie) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Parse user data
    const userData = JSON.parse(userDataCookie);
    const userRole = userData.user?.role;
    const isPlatformAdmin = userData.is_platform_admin;

    // Check route permissions
    for (const [routePrefix, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
      if (pathname.startsWith(routePrefix)) {
        // Check if user has permission
        const hasPermission = allowedRoles.some(role => {
          if (role === 'platform_admin') {
            return isPlatformAdmin === true;
          }
          return userRole === role;
        });

        if (!hasPermission) {
          // Redirect to 403 Forbidden page
          const forbiddenUrl = new URL('/403', request.url);
          forbiddenUrl.searchParams.set('attempted', pathname);
          return NextResponse.redirect(forbiddenUrl);
        }
      }
    }
  } catch (error) {
    console.error('Error parsing user data in middleware:', error);
    // Clear invalid cookies and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    response.cookies.delete('user_data');
    return response;
  }

  return NextResponse.next();
}

// Default export for compatibility
export default proxy;

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
