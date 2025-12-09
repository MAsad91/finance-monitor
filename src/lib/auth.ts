import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export async function getUserIdFromToken(request: NextRequest | Request): Promise<string | null> {
  try {
    // Handle both NextRequest (has cookies.get) and Request (has headers)
    let token: string | undefined;
    
    if ("cookies" in request && typeof request.cookies.get === "function") {
      // NextRequest
      token = (request as NextRequest).cookies.get("auth-token")?.value;
    } else {
      // Request - extract from cookie header
      const cookieHeader = (request as Request).headers.get("cookie");
      if (cookieHeader) {
        const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split("=");
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);
        token = cookies["auth-token"];
      }
    }

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || "fallback-secret-change-in-production"
    ) as { id: string };

    return decoded.id;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

