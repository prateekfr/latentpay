import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Protect dashboard and advertiser pages
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/advertiser(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/dashboard(.*)",
    "/advertiser(.*)",
  ],
};
