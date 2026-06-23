// Language switching without URL changes
// We handle language switching through React Context, not URL routing

export function middleware() {
  // No-op middleware - language switching is handled client-side
}

export const config = {
  // Match all routes except API and static files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
