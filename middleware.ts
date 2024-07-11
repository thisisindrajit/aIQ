import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/user(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId, sessionId } = auth();

    // Redirect to the homepage if the user is not signed in
    if (!userId || !sessionId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}`);
    }

    // Protect the route (Use this only if authorization is required)
    // auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
