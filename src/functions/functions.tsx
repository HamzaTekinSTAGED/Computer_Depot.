import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";

export const useAuthCheck = (
  status: "loading" | "authenticated" | "unauthenticated",
  setIsLoading: (value: boolean) => void,
  redirectPath: string = "/hero"
) => {
  const router = useRouter();
  const redirectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    // Clear any existing timeout
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }

    if (status === "authenticated") {
      // Add a small delay to prevent multiple redirects
      redirectTimeoutRef.current = setTimeout(() => {
        router.push(redirectPath);
      }, 100);
    } else {
      setIsLoading(false);
    }

    // Cleanup timeout on unmount
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [status, router, redirectPath, setIsLoading]);
};

export const useRoleBasedRedirect = (
  status: "loading" | "authenticated" | "unauthenticated",
  session: Session | null,
  setIsLoading: (value: boolean) => void
) => {
  const router = useRouter();
  const redirectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }

    if (status === "authenticated" && session) {
      
      redirectTimeoutRef.current = setTimeout(() => {
        if (session.user.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/hero");
        }
        setIsLoading(false);
      }, 300);
    } else if (status === "unauthenticated") {
      router.push("/Authentication/login");
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [status, session, router, setIsLoading]);
}; 

