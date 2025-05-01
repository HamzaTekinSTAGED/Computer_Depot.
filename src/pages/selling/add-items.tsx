"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar";
import UserInfo from "../../components/UserInfo";
import Image from "next/image";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";
import LoadingSpinner from "../../components/loading";

interface Category {
  categoryID: number;
  name: string;
  description: string | null;
}

export default function SellPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [item, setItem] = useState({ 
    title: "", 
    description: "", 
    price: "", 
    amount: "1",
    maxBuyAmount: "1",
    categoryID: "",
    imageURL: ""
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/Authentication/register");
    }
  }, [status, router]);

  useEffect(() => {
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

    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Input sanitization
    const sanitizedValue = value.replace(/[<>]/g, '');
    
    setItem(prev => {
      const newItem = { ...prev, [name]: sanitizedValue };
      
      // If amount is changed, check and adjust maxBuyAmount if needed
      if (name === 'amount') {
        const amount = parseInt(sanitizedValue) || 0;
        const maxBuyAmount = parseInt(newItem.maxBuyAmount) || 0;
        if (maxBuyAmount > amount) {
          newItem.maxBuyAmount = amount.toString();
        }
      }
      
      // If maxBuyAmount is changed, ensure it's not greater than amount
      if (name === 'maxBuyAmount') {
        const amount = parseInt(newItem.amount) || 0;
        const maxBuyAmount = parseInt(sanitizedValue) || 0;
        if (maxBuyAmount > amount) {
          newItem.maxBuyAmount = amount.toString();
        }
      }
      
      return newItem;
    });
    
    setError(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // File size check (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      try {
        setImagePreview(URL.createObjectURL(file));
        const cloudinaryUrl = await uploadToCloudinary(file);
        setItem(prev => ({ ...prev, imageURL: cloudinaryUrl }));
      } catch (error) {
        console.error('Error uploading image:', error);
        setError("Failed to upload image. Please try again.");
        setImagePreview(null);
      }
      e.target.value = "";
    }
  };

  const handleImageDelete = () => {
    setImagePreview(null);
    setItem(prev => ({ ...prev, imageURL: "" })); // Clear the Cloudinary URL too
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    if (!session?.user?.id) {
      setError("Please login to add a product");
      setIsSubmitting(false);
      return;
    }

    try {
      // Form validation
      if (!item.title || !item.description || !item.price || !item.categoryID || !item.amount) {
        const missingFields = [];
        if (!item.title) missingFields.push("title");
        if (!item.description) missingFields.push("description");
        if (!item.price) missingFields.push("price");
        if (!item.amount) missingFields.push("amount");
        if (!item.categoryID) missingFields.push("category");
        
        setError(`Please fill in the following fields: ${missingFields.join(", ")}`);
        setIsSubmitting(false);
        return;
      }

      // Price validation
      const price = parseFloat(item.price);
      if (isNaN(price) || price <= 0) {
        setError("Please enter a valid price");
        setIsSubmitting(false);
        return;
      }

      // Amount validation
      const amount = parseInt(item.amount);
      if (isNaN(amount) || amount <= 0 || amount > 9999) {
        setError("Please enter a valid amount (1-9999)");
        setIsSubmitting(false);
        return;
      }

      // Max Buy Amount validation
      const maxBuyAmount = parseInt(item.maxBuyAmount);
      if (isNaN(maxBuyAmount) || maxBuyAmount <= 0 || maxBuyAmount > amount) {
        setError("Max buy amount must be at least 1 and cannot exceed the total amount");
        setIsSubmitting(false);
        return;
      }

      const productData = {
        title: item.title,
        description: item.description,
        price: price,
        amount: amount,
        maxBuyAmount: maxBuyAmount,
        category: item.categoryID,
        imageURL: item.imageURL || null,
        userID: parseInt(session.user.id),
        isSold: false
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to create product');
      }

      router.push('/buying/list-items');
    } catch (error) {
      console.error('Error details:', error);
      setError(error instanceof Error ? error.message : "An error occurred while adding the product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen relative">
      <Sidebar onExpand={setIsSidebarExpanded} />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarExpanded ? "ml-64" : "ml-20"}`}>
        {status === "loading" ? (
          <div className="flex justify-center items-center h-full"> 
            <LoadingSpinner />
          </div>
        ) : (
          <div className="max-w-6xl mx-auto mt-10 p-8 bg-white shadow-xl rounded-xl">
            <h2 className="text-2xl font-semibold mb-4">Add Product</h2>
            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col space-y-8">
              <div className="flex space-x-12">
                <div className="flex flex-col items-center space-y-4">
                  <label htmlFor="image-upload" className="w-80 h-80 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer relative">
                    {imagePreview ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-contain rounded-lg"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <span className="text-gray-500">Click to upload image</span>
                    )}
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="sr-only"
                    aria-label="Upload image"
                  />
                  {imagePreview && (
                    <button type="button" onClick={handleImageDelete} className="bg-red-500 text-white px-4 py-2 rounded-lg text-lg">
                      Delete Image
                    </button>
                  )}
                </div>
                <div className="flex-1 space-y-8">
                  <input 
                    name="title" 
                    type="text" 
                    placeholder="Product Title" 
                    value={item.title} 
                    onChange={handleChange} 
                    required 
                    maxLength={100}
                    className="w-full p-4 border rounded-lg text-xl" 
                  />
                  <input 
                    name="price" 
                    type="number" 
                    placeholder="Price ($)" 
                    value={item.price} 
                    onChange={handleChange} 
                    required 
                    min="0.01"
                    step="0.01"
                    className="w-full p-4 border rounded-lg text-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                  />
                  <div className="flex space-x-4">
                    <input 
                      name="amount" 
                      type="number" 
                      placeholder="Amount" 
                      value={item.amount} 
                      onChange={handleChange} 
                      required 
                      min="1"
                      max="9999"
                      className="w-1/2 p-4 border rounded-lg text-xl" 
                    />
                    <input 
                      name="maxBuyAmount" 
                      type="number" 
                      placeholder="Max Buy Amount" 
                      value={item.maxBuyAmount} 
                      onChange={handleChange} 
                      required 
                      min="1"
                      max={item.amount || "9999"}
                      className="w-1/2 p-4 border rounded-lg text-xl" 
                    />
                  </div>
                  <select name="categoryID" value={item.categoryID} onChange={handleChange} required className="w-full p-4 border rounded-lg text-xl">
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.categoryID} value={category.categoryID}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <textarea 
                name="description" 
                placeholder="Product Description" 
                value={item.description} 
                onChange={handleChange} 
                required 
                maxLength={1000}
                className="w-full p-4 border rounded-lg text-xl" 
                rows={5} 
              />
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full py-4 rounded-lg text-xl font-semibold text-white ${
                  isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? 'Adding...' : 'Add Product'}
              </button>
            </form>
          </div>
        )}
      </div>
      {session && <UserInfo session={session} />}
    </div>
  );
}
