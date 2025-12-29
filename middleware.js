import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // App routes
    "/((?!_next|favicon.ico).*)",
    // API routes
    "/api/(.*)",
  ],
};
