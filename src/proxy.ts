import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Middleware (renamed to 'proxy' in this version)
 */
export default function proxy(request: NextRequest) {
  console.log(`[Proxy] Request: ${request.nextUrl.pathname}`);
  // Authentication is disabled for development/testing
  // This allows you to test the Instagram connect flow without Clerk blockers
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and .well-known paths
    '/((?!_next|.well-known|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
