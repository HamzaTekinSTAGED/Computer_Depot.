"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/sidebar';
import UserInfo from '../../components/UserInfo';
import { Category } from '@/types';



export default function CategoriesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/register");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/hero");
    }
  }, [status, router, session]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create category');
      }

      const createdCategory = await response.json();
      setCategories([...categories, createdCategory]);
      setNewCategory({ name: '', description: '' });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen relative bg-white">
      <Sidebar onExpand={setIsSidebarExpanded} />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarExpanded ? "ml-64" : "ml-20"}`}>
        <div className="max-w-6xl mx-auto mt-10 p-8 bg-background-gray shadow-xl rounded-xl">
          <h2 className="text-2xl font-semibold mb-4 text-primary-dark">Manage Categories</h2>
          
          {/* Add Category Form */}
          <form onSubmit={handleSubmit} className="mb-8 p-6 border border-primary-dark rounded-lg bg-white">
            <h3 className="text-xl font-semibold mb-4 text-primary-dark">Add New Category</h3>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-primary-dark">Category Name</label>
                <input
                  type="text"
                  id="name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-dark focus:ring-primary-dark"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-primary-dark">Description</label>
                <textarea
                  id="description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-dark focus:ring-primary-dark"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-dark hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark"
              >
                Add Category
              </button>
            </div>
          </form>

          {/* Categories List */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 text-primary-dark">Existing Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div key={category.categoryID} className="p-4 border border-primary-dark rounded-lg bg-white">
                  <h4 className="font-semibold text-primary-dark">{category.name}</h4>
                  {category.description && (
                    <p className="text-primary-dark mt-2">{category.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {session && <UserInfo session={session} />}
    </div>
  );
} 