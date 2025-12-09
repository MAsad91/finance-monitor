"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { checkSession, clearAuth } from "@/store/authSlice";
import { useRouter, usePathname } from "next/navigation";

export default function AuthInitializer() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  const hasCheckedSession = useRef(false);
  const tokenCheckInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Don't check session on auth pages (signin/signup)
    const isAuthPage = pathname === "/signin" || pathname === "/signup" || pathname === "/sign-in" || pathname === "/sign-up";
    
    // Check session on mount only once, and only if not on auth pages
    // We check even if isLoading is true (initial state) to start the session check
    if (!hasCheckedSession.current && !isAuthPage) {
      hasCheckedSession.current = true;
      dispatch(checkSession());
    }

    // Set up periodic token expiration check (every 5 minutes)
    // This ensures we catch expired tokens even if the user is idle
    if (!isAuthPage && isAuthenticated) {
      tokenCheckInterval.current = setInterval(() => {
        dispatch(checkSession());
      }, 5 * 60 * 1000); // Check every 5 minutes
    }

    // Also check token when user returns to the tab/window (focus event)
    const handleFocus = () => {
      if (!isAuthPage && isAuthenticated) {
        dispatch(checkSession());
      }
    };

    window.addEventListener("focus", handleFocus);

    // Cleanup interval and event listener on unmount or when navigating away
    return () => {
      if (tokenCheckInterval.current) {
        clearInterval(tokenCheckInterval.current);
        tokenCheckInterval.current = null;
      }
      window.removeEventListener("focus", handleFocus);
    };
  }, [dispatch, pathname, isAuthenticated]);

  // Handle token expiration - redirect to login if session check fails
  // This effect only runs when we're not on auth pages and session check has completed
  useEffect(() => {
    const isAuthPage = pathname === "/signin" || pathname === "/signup" || pathname === "/sign-in" || pathname === "/sign-up";
    
    // Only redirect if:
    // 1. We're not on an auth page
    // 2. Loading is complete
    // 3. We're not authenticated (session check failed or token expired)
    // 4. We've already checked the session at least once
    if (!isAuthPage && !isLoading && !isAuthenticated && hasCheckedSession.current) {
      // Clear auth state and redirect to login
      dispatch(clearAuth());
      // Use setTimeout to prevent redirect during render
      const timer = setTimeout(() => {
        router.push("/signin");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, pathname, router, dispatch]);

  return null;
}

