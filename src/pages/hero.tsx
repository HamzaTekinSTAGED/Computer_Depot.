import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "../components/sidebar";
import UserInfo from "../components/UserInfo";

const HeroPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  useEffect(() => {
    // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Yükleniyor durumu
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
      {session && <UserInfo session={session} />}
    </div>
  );
};

export default HeroPage;
