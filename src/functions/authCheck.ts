import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { Router } from "@/types";


export const checkAuthAndRedirect = (
  router: Router,
  setIsLoading: (value: boolean) => void
) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      router.push("/hero");
    } else {
      setIsLoading(false);
    }
  });
}; 