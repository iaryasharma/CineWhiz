import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // Check if the user is trying to access a protected route
  if (request.nextUrl.pathname.startsWith("/watchlist") && !token) {
    // Redirect to the sign-in page if not authenticated
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/watchlist/:path*"],
}
