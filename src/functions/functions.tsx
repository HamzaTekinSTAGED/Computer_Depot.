import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";

export const useAuthCheck = (
  status: "loading" | "authenticated" | "unauthenticated",
  setIsLoading: (value: boolean) => void,
  redirectPath: string = "/hero"
) => {
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push(redirectPath);
    } else {
      setIsLoading(false);
    }
  }, [status, router, redirectPath, setIsLoading]);
}; 