import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Only apply to admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Get admin credentials from environment variables or use defaults
    const adminUser = process.env.ADMIN_USERNAME || "admin"
    const adminPass = process.env.ADMIN_PASSWORD || "password123"

    // Check for Basic Auth header
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return new NextResponse("Authentication required", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Admin Access Required"',
        },
      })
    }

    // Validate credentials
    try {
      const encodedCredentials = authHeader.split(" ")[1]
      const decodedCredentials = atob(encodedCredentials)
      const [username, password] = decodedCredentials.split(":")

      if (username !== adminUser || password !== adminPass) {
        return new NextResponse("Invalid credentials", {
          status: 401,
          headers: {
            "WWW-Authenticate": 'Basic realm="Admin Access Required"',
          },
        })
      }
    } catch (error) {
      return new NextResponse("Invalid authentication format", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Admin Access Required"',
        },
      })
    }
  }

  return NextResponse.next()
}

// Configure the middleware to only run on admin routes
export const config = {
  matcher: "/admin/:path*",
}
