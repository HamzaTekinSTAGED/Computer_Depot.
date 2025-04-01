import { Session } from "next-auth";
import Sidebar from "../sidebar";
import UserInfo from "../UserInfo";

interface AdminDashboardProps {
  session: Session;
  isSidebarExpanded: boolean;
  setIsSidebarExpanded: (expanded: boolean) => void;
}

const AdminDashboard = ({ session, isSidebarExpanded, setIsSidebarExpanded }: AdminDashboardProps) => {
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
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">User Management</h2>
            <p className="text-gray-600">Manage user accounts and permissions</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Product Overview</h2>
            <p className="text-gray-600">View and manage all products</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Sales Analytics</h2>
            <p className="text-gray-600">Track sales and revenue</p>
          </div>
        </div>
      </main>

      {/* User Info */}
      {session && <UserInfo session={session} />}
    </div>
  );
};

export default AdminDashboard; 