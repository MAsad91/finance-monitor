"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { checkSession } from "@/store/authSlice";
import { useRouter, usePathname } from "next/navigation";

export default function AuthInitializer() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  const hasCheckedSession = useRef(false);

  useEffect(() => {
    // Don't check session on auth pages (signin/signup)
    const isAuthPage = pathname === "/signin" || pathname === "/signup" || pathname === "/sign-in" || pathname === "/sign-up";
    
    // Check session on mount only once, and only if not on auth pages
    // We check even if isLoading is true (initial state) to start the session check
    if (!hasCheckedSession.current && !isAuthPage) {
      hasCheckedSession.current = true;
      dispatch(checkSession());
    }
  }, [dispatch, pathname]);

  return null;
}

