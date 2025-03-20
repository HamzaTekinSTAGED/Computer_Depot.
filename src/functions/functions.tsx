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