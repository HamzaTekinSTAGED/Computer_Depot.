import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "../components/sidebar";
import UserInfo from "../components/UserInfo";
import { useRoleBasedRedirect } from "../functions/functions";
import LoadingSpinner from "../components/loading";

const HeroPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/Authentication/login");
    }
  }, [status, router]);

  useRoleBasedRedirect(status, session, setIsLoading);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <Sidebar onExpand={setIsSidebarExpanded} />

        {/* Main Content */}
        <main className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarExpanded ? 'ml-[304px]' : 'ml-20'}`}>
          {(status === "loading" || isLoading) ? (
            <div className="flex justify-center items-center h-full">
              <LoadingSpinner />
            </div>
          ) : session ? (
            <div className="flex flex-col items-center justify-center text-center h-full">
              <h1 className="text-4xl font-bold">
                Find, best tech equipment - quickly and easily!
              </h1>
            </div>
          ) : null}
        </main>

        {/* User Info */}
        {session && <UserInfo session={session} />}
      </div>
    </div>
  );
};

export default HeroPage;
