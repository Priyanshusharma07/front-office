import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

console.log('PROXY ACTIVE');

// Public routes: never redirect to sign-in
const isPublicRoute = createRouteMatcher([
  '/login(.*)',
  '/signup(.*)',
  '/instagram/callback(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  const pathname = request.nextUrl.pathname;
  console.log('PATH:', pathname);

  if (!isPublicRoute(request)) {
    const { userId } = await auth();
    console.log('TOKEN_EXISTS:', !!userId);
    if (!userId) {
      console.log('REDIRECT_TO_LOGIN:', pathname);
      return (await auth()).redirectToSignIn({ returnBackUrl: request.url });
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and .well-known paths
    '/((?!_next|.well-known|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
