import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/sidebar";
import UserInfo from "../../components/UserInfo";
import EditProductModal from "../../components/EditProductModal";
import { Product,Category } from "@/types";
import { FiEdit2 } from "react-icons/fi";

const ProductsPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  // Fetch products and categories on component mount
  useEffect(() => {
    if (session?.user?.role !== "ADMIN") {
      router.push("/hero");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch products with related category and user data
        const productsResponse = await fetch("/api/products");
        if (!productsResponse.ok) {
          throw new Error(`Failed to fetch products: ${productsResponse.status}`);
        }
        const productsData = await productsResponse.json();
        setProducts(productsData);

        // Fetch categories
        const categoriesResponse = await fetch("/api/categories");
        if (!categoriesResponse.ok) {
          throw new Error(`Failed to fetch categories: ${categoriesResponse.status}`);
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, router]);

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.categoryID.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Function to open the modal
  const openEditModal = (productId: number) => {
    setEditingProductId(productId);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeEditModal = () => {
    setEditingProductId(null);
    setIsModalOpen(false);
    fetchData();
  };

  // Define fetchData here or ensure it's accessible if defined elsewhere
  // Example: (ensure this function exists and is compatible)
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const productsResponse = await fetch("/api/products");
      if (!productsResponse.ok) {
        throw new Error(`Failed to fetch products: ${productsResponse.status}`);
      }
      const productsData = await productsResponse.json();
      setProducts(productsData);

      // Maybe re-fetch categories too if they can change, otherwise remove
      const categoriesResponse = await fetch("/api/categories");
      if (!categoriesResponse.ok) {
        throw new Error(`Failed to fetch categories: ${categoriesResponse.status}`);
      }
      const categoriesData = await categoriesResponse.json();
      setCategories(categoriesData);

    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
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
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <Sidebar onExpand={setIsSidebarExpanded} />

        {/* Main Content */}
        <main
          className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarExpanded ? "ml-64" : "ml-20"} bg-white`}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-primary-dark">Products Management</h1>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>{error}</p>
              </div>
            )}

            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-primary-dark">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md pl-10 focus:border-primary-dark focus:ring-primary-dark text-primary-dark"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔍
                  </span>
                </div>
                <div className="w-full md:w-48">
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-primary-dark focus:ring-primary-dark text-primary-dark"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option
                        key={category.categoryID}
                        value={category.categoryID.toString()}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-primary-dark">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-primary-dark">
                  <thead className="bg-background-gray">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary-dark uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary-dark uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary-dark uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary-dark uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary-dark uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary-dark uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary-dark uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary-dark uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-primary-dark">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <tr key={product.productID}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-dark">
                            {product.productID}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-dark">
                            {product.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-dark">
                            {categories.find(c => c.categoryID === product.categoryID)?.name || "Unknown"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-dark">
                            ${product.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-dark">
                            {product.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                product.amount === 0
                                  ? "bg-red-100 text-red-800"
                                  : "bg-secondary-light text-blue-800"
                              }`}
                            >
                              {product.amount === 0 ? "Sold Out" : "Available"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-dark">
                            {formatDate(product.publishingDate.toString())}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => openEditModal(product.productID)}
                              className="inline-flex items-center px-3 py-1.5 border
                               border-transparent text-xs font-medium rounded-md
                                text-white bg-primary-dark hover:bg-primary-dark hover:bg-opacity-90
                                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark"
                            >
                              <FiEdit2 className="h-4 w-4 mr-1" />
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-6 py-4 text-center text-sm text-primary-dark">
                          No products found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>

        {/* User Info */}
        {session && <UserInfo session={session} />}

        {/* Edit Product Modal */}
        {isModalOpen && editingProductId && (
          <EditProductModal 
            productId={editingProductId}
            onClose={closeEditModal}
            onSave={fetchData}
          />
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
