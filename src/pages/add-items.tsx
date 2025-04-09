"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import UserInfo from "../components/UserInfo";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";

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
  const [item, setItem] = useState({ 
    title: "", 
    description: "", 
    price: "", 
    amount: "1",
    categoryID: "",
    imageURL: ""
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/register");
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
    setItem({ ...item, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const file = e.target.files[0];
        console.log('Selected file:', {
          name: file.name,
          size: file.size,
          type: file.type
        });

        // Show preview immediately
        setImagePreview(URL.createObjectURL(file));
        
        // Verify environment variables
        console.log('Cloudinary config:', {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          hasApiKey: !!process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
        });

        // Upload to Cloudinary
        const cloudinaryUrl = await uploadToCloudinary(file);
        console.log('Cloudinary upload completed:', cloudinaryUrl);
        
        setItem(prev => ({ ...prev, imageURL: cloudinaryUrl }));
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Resim yükleme hatası. Lütfen tekrar deneyin. Hata: ' + (error instanceof Error ? error.message : String(error)));
        setImagePreview(null);
      }
      e.target.value = ""; // Reset file input
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
    
    if (!session?.user?.id) {
      alert("Please login to add a product");
      return;
    }

    try {
      // Form validation
      console.log('Form values:', {
        title: item.title,
        description: item.description,
        price: item.price,
        amount: item.amount,
        categoryID: item.categoryID
      });

      if (!item.title || !item.description || !item.price || !item.categoryID || !item.amount) {
        const missingFields = [];
        if (!item.title) missingFields.push("title");
        if (!item.description) missingFields.push("description");
        if (!item.price) missingFields.push("price");
        if (!item.amount) missingFields.push("amount");
        if (!item.categoryID) missingFields.push("category");
        
        const errorMessage = `Please fill in the following fields: ${missingFields.join(", ")}`;
        console.error('Validation error:', errorMessage);
        alert(errorMessage);
        return;
      }

      const productData = {
        title: item.title,
        description: item.description,
        price: parseFloat(item.price),
        amount: parseInt(item.amount),
        category: item.categoryID,
        imageURL: item.imageURL || null,
        userID: parseInt(session.user.id),
        isSold: false
      };

      console.log('Submitting product data:', productData);

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to create product');
      }

      router.push('/list-items');
      alert("Product added successfully!");
    } catch (error) {
      console.error('Error details:', error);
      alert(error instanceof Error ? error.message : "An error occurred while adding the product. Please try again.");
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen relative">
      <Sidebar onExpand={setIsSidebarExpanded} />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarExpanded ? "ml-64" : "ml-20"}`}>
        <div className="max-w-6xl mx-auto mt-10 p-8 bg-white shadow-xl rounded-xl">
          <h2 className="text-2xl font-semibold mb-4">Add Product</h2>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-8">
            <div className="flex space-x-12">
              <div className="flex flex-col items-center space-y-4">
                <label htmlFor="image-upload" className="w-80 h-80 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer relative">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
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
                <input name="title" type="text" placeholder="Product Title" value={item.title} onChange={handleChange} required className="w-full p-4 border rounded-lg text-xl" />
                <input 
                  name="price" 
                  type="number" 
                  placeholder="Price ($)" 
                  value={item.price} 
                  onChange={handleChange} 
                  required 
                  className="w-full p-4 border rounded-lg text-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                />
                <input name="amount" type="number" placeholder="Amount" value={item.amount} onChange={handleChange} required min="1" className="w-full p-4 border rounded-lg text-xl" />
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
            <textarea name="description" placeholder="Product Description" value={item.description} onChange={handleChange} required className="w-full p-4 border rounded-lg text-xl" rows={5} />
            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-lg text-xl font-semibold">Add Product</button>
          </form>
        </div>
      </div>
      {session && <UserInfo session={session} />}
    </div>
  );
}
