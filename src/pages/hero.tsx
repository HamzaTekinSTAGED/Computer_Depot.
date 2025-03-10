import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../firebase";
import Sidebar from "../components/sidebar";
import UserInfo from "../components/UserInfo";

const HeroPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

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
      <Sidebar onExpand={setIsSidebarExpanded} />

      {/* Main Content */}
      <main className={`flex-1 flex flex-col items-center justify-center text-center transition-all duration-300 ease-in-out ${isSidebarExpanded ? 'ml-64' : 'ml-20'}`}>
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
