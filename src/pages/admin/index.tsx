import { useSession } from "next-auth/react";
import Sidebar from "../../components/sidebar";
import UserInfo from "../../components/UserInfo";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AdminDashboard = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  useEffect(() => {
    if (session?.user?.role !== "ADMIN") {
      router.push("/hero");
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (session?.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="flex h-screen relative">
      {/* Sidebar */}
      <Sidebar onExpand={setIsSidebarExpanded} />

      {/* Main Content */}
      <main className={`flex-1 flex flex-col items-center justify-center text-center transition-all duration-300 ease-in-out ${isSidebarExpanded ? 'ml-64' : 'ml-20'}`}>
        <h1 className="text-4xl font-bold mb-8">
          Admin Dashboard
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          <button 
            onClick={() => router.push('/admin/categories')}
            className="w-full text-left bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200"
          >
            <h2 className="text-2xl font-semibold mb-4">Categories</h2>
            <p className="text-gray-600">Manage categories</p>
          </button>

          <button 
            onClick={() => router.push('/admin/products')}
            className="w-full text-left bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200"
          >
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Products</h2>
            <p className="text-gray-600">View and manage all products</p>
          </div>
          </button>
          <button 
            onClick={() => router.push('/admin/users')}
            className="w-full text-left bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200"
          >
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Users</h2>
            <p className="text-gray-600">View and manage all users</p>
          </div>
          </button>
        </div>
      </main>

      {/* User Info */}
      {session && <UserInfo session={session} />}
    </div>
  );
};

export default AdminDashboard; 