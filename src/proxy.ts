import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Middleware (renamed to 'proxy' in this version)
 */
export default function proxy(request: NextRequest) {
  console.log('PROXY ACTIVE');
  const pathname = request.nextUrl.pathname;

  // Retrieve token from cookie (e.g. Clerk's '__session' cookie in development/mock)
  const token = request.cookies.get('__session')?.value || request.cookies.get('token')?.value;

  const publicRoutes = [
    '/login',
    '/instagram/select',
    '/instagram/callback'
  ];

  const redirectCondition = !token && !publicRoutes.includes(pathname);

  // Phase 4 — Add Auth Debug Logs
  console.log('PATH:', pathname);
  console.log('TOKEN_EXISTS:', !!token);
  console.log('REDIRECTING_TO_LOGIN:', redirectCondition);

  if (redirectCondition) {
    console.log('REDIRECT_TO_LOGIN:', pathname);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and .well-known paths
    '/((?!_next|.well-known|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
