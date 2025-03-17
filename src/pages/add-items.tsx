"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import UserInfo from "../components/UserInfo";

export default function SellPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [item, setItem] = useState({ title: "", description: "", price: "", category: "" });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/register");
    }
  }, [status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setItem({ ...item, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImagePreview(URL.createObjectURL(e.target.files[0]));
      e.target.value = ""; // Reset file input
    }
  };

  const handleImageDelete = () => {
    setImagePreview(null);
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      alert("Lütfen ürün eklemek için giriş yapın");
      return;
    }

    try {
      // Form validation
      if (!item.title || !item.description || !item.price || !item.category) {
        alert("Lütfen tüm alanları doldurun");
        return;
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: item.title,
          description: item.description,
          price: parseFloat(item.price),
          category: item.category,
          imageURL: imagePreview || null,
          userID: parseInt(session.user.id)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Ürün oluşturulamadı');
      }

      router.push('/products');
      alert("Ürün başarıyla eklendi!");
    } catch (error) {
      console.error('Hata:', error);
      alert(error instanceof Error ? error.message : "Ürün eklenirken bir hata oluştu. Lütfen tekrar deneyin.");
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
          <h2 className="text-2xl font-semibold mb-4">Sell Your Item</h2>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-8">
            <div className="flex space-x-12">
              <div className="flex flex-col items-center space-y-4">
                <label htmlFor="image-upload" className="w-80 h-80 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer relative">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-gray-500">Click to upload</span>
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
                <input name="title" type="text" placeholder="Item Title" value={item.title} onChange={handleChange} required className="w-full p-4 border rounded-lg text-xl" />
                <input name="price" type="number" placeholder="Price ($)" value={item.price} onChange={handleChange} required className="w-full p-4 border rounded-lg text-xl" />
                <select name="category" value={item.category} onChange={handleChange} required className="w-full p-4 border rounded-lg text-xl">
                  <option value="">Select Category</option>
                  <option value="cpu">CPU</option>
                  <option value="gpu">GPU</option>
                  <option value="ram">RAM</option>
                  <option value="storage">Storage</option>
                </select>
              </div>
            </div>
            <textarea name="description" placeholder="Description" value={item.description} onChange={handleChange} required className="w-full p-4 border rounded-lg text-xl" rows={5} />
            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-lg text-xl font-semibold">Add Item</button>
          </form>
        </div>
      </div>
      {session && <UserInfo session={session} />}
    </div>
  );
}
