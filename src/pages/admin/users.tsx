"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/sidebar';
import UserInfo from '../../components/UserInfo';
import { FiUser, FiMail, FiEdit2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { EditUserModal } from '../../components/EditUserModal';
import { editUser } from '../../utils/editUser';
import { User } from '../../types/user';

export default function UsersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/register");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/hero");
    }
  }, [status, router, session]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      } else {
        setError('An error occurred while loading users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('An error occurred while loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleSidebarExpand = (expanded: boolean) => {
    setIsSidebarExpanded(expanded);
  };

  const handleEditUser = async (updatedUser: Partial<User>) => {
    if (!selectedUser) return;
    
    try {
      await editUser({ ...selectedUser, ...updatedUser }, async (user) => {
        // Update the users list with the new data
        setUsers(prevUsers => 
          prevUsers.map(u => u.userID === user.userID ? { ...u, ...user } : u)
        );
        setFilteredUsers(prevUsers => 
          prevUsers.map(u => u.userID === user.userID ? { ...u, ...user } : u)
        );
        setIsModalOpen(false);
        setSelectedUser(null);
      });
    } catch (error) {
      setError('Failed to update user. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <Sidebar onExpand={handleSidebarExpand} />

        {/* Main Content */}
        <main
          className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
            isSidebarExpanded ? "ml-64" : "ml-20"
          }`}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">User Management</h1>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>{error}</p>
              </div>
            )}

            {/* Search */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md pl-10"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </span>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product Count
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center">
                          <div className="flex justify-center">
                            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        </td>
                      </tr>
                    ) : filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <motion.tr 
                          key={user.userID}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <FiUser className="h-5 w-5 text-indigo-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name} {user.surname}</div>
                                <div className="text-sm text-gray-500">@{user.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <FiMail className="h-4 w-4 text-gray-400 mr-2" />
                              <div className="text-sm text-gray-900">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'ADMIN' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {user.role === 'ADMIN' ? 'Admin' : 'User'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.products?.length || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setIsModalOpen(true);
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <FiEdit2 className="h-4 w-4 mr-1" />
                              Edit
                            </button>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          {searchTerm ? 'No users found matching search criteria' : 'No users found'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>

        {/* Edit User Modal */}
        {selectedUser && (
          <EditUserModal
            user={selectedUser}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedUser(null);
            }}
            onSave={handleEditUser}
          />
        )}

        {/* User Info */}
        {session && <UserInfo session={session} />}
      </div>
    </div>
  );
}
