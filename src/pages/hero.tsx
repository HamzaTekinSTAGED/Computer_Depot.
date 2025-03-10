import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../firebase";
import Sidebar from "../components/sidebar"; // Import Sidebar instead of Navbar
import UserInfo from "../components/UserInfo";

const HeroPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/register");
      } else {
        setUser(user);
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex h-screen relative">
      {/* Sidebar */}
      <Sidebar /> 

      {/* Main Content */}
      <main className="flex-1 ml-20 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold">
          Find, best tech equipment - quickly and easily!
        </h1>
      </main>

      {/* User Info */}
      {user && <UserInfo user={user} />}
    </div>
  );
};

export default HeroPage;
