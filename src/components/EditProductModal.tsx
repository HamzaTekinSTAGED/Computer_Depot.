import { useState, useEffect, FormEvent } from 'react';
import { Product, Category } from '@/types';
// Assuming Product and Category types are defined elsewhere or we define them here
// Let's redefine simplified versions here for clarity
type ProductFormData = {
  title: string;
  description: string;
  price: number;
  amount: number;
  categoryID: number;
  imageURL: string | null;
  isSold: boolean;
};


interface EditProductModalProps {
  productId: number;
  onClose: () => void;
  onSave: () => void; // Function to trigger data refresh on the parent page
}

const EditProductModal = ({ productId, onClose, onSave }: EditProductModalProps) => {
  const [formData, setFormData] = useState<Partial<ProductFormData>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch product details
        const productRes = await fetch(`/api/products/${productId}`);
        if (!productRes.ok) {
          throw new Error(`Failed to fetch product details: ${productRes.status}`);
        }
        const productData: ProductFormData = await productRes.json();
        setFormData(productData);

        // Fetch categories
        const categoriesRes = await fetch('/api/categories');
        if (!categoriesRes.ok) {
          throw new Error(`Failed to fetch categories: ${categoriesRes.status}`);
        }
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);

      } catch (err) {
        console.error("Error fetching data for modal:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
  
    let processedValue: string | number | boolean = value;
  
    if (type === 'number') {
      processedValue = value === '' ? '' : parseFloat(value); // Keep empty string or parse to float
    } else if (type === 'checkbox') {
      // Assuming the checkbox input has a 'checked' property
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'categoryID') {
        processedValue = parseInt(value, 10); // Ensure categoryID is an integer
    }
  
    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Convert price and amount from state (which might be number or string) to numbers for validation
    const priceAsNumber = Number(formData.price);
    const amountAsNumber = Number(formData.amount);

    // Basic validation 
    // isNaN handles empty string case as well (Number('') is 0, but we check < 0)
    if (isNaN(priceAsNumber) || priceAsNumber < 0) { 
        setError("Price must be a non-negative number.");
        return;
    }
    // isNaN handles empty string; !Number.isInteger checks for non-integers (including decimals)
    if (isNaN(amountAsNumber) || !Number.isInteger(amountAsNumber) || amountAsNumber < 0) {
        setError("Amount must be a non-negative integer.");
        return;
    }
    
    // Prepare data for submission, ensuring numeric types are correct
    const submissionData = {
        ...formData,
        price: priceAsNumber,
        amount: amountAsNumber,
    };

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT', // or PATCH
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData), // Send validated and type-corrected data
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update product' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Product updated successfully
      console.log('Product updated successfully');
      onSave(); // Trigger refresh on parent page
      onClose(); // Close the modal

    } catch (err) {
      console.error("Error updating product:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during update");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4">Edit Product (ID: {productId})</h2>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {!loading && !error && (
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={3}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Price */}
            <div className="mb-4">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price ?? ''} // Use empty string if null/undefined
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

             {/* Amount */}
            <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount ?? ''} // Use empty string if null/undefined
                    onChange={handleChange}
                    required
                    min="0"
                    step="1" // Integer steps
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>


            {/* Category */}
            <div className="mb-4">
              <label htmlFor="categoryID" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                id="categoryID"
                name="categoryID"
                value={formData.categoryID || ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="" disabled>Select a category</option>
                {categories.map(cat => (
                  <option key={cat.categoryID} value={cat.categoryID}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Image URL */}
            <div className="mb-4">
              <label htmlFor="imageURL" className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="text"
                id="imageURL"
                name="imageURL"
                value={formData.imageURL || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Is Sold */}
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="isSold"
                name="isSold"
                checked={formData.isSold || false}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isSold" className="ml-2 block text-sm text-gray-900">Mark as Sold</label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                disabled={loading} // Disable submit while loading initial data or during submission (add submission loading state if desired)
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditProductModal; 