"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar";
import UserInfo from "../../components/UserInfo";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Trash2 } from "lucide-react";

interface CartItem {
    id: number;
    user_id: number;
    product_id: number;
    added_amount: number;
    priceforoneItem: number;
    product: {
        title: string;
        imageURL: string | null;
        description: string;
    };
}

export default function CartPage() {
    const { data: session } = useSession();
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                const res = await fetch("/api/cart");
                if (!res.ok) {
                    throw new Error("Sepet içeriği getirilemedi.");
                }
                const data = await res.json();
                setCartItems(data);
            } catch (error) {
                console.error("Sepet hatası:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (session?.user?.id) {
            fetchCartItems();
        }
    }, [session?.user?.id]);

    const handleRemoveItem = async (cartItemId: number) => {
        try {
            setIsDeleting(cartItemId);
            const response = await fetch("/api/cart", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ cartItemId }),
            });

            if (!response.ok) {
                throw new Error("Ürün sepetten çıkarılamadı.");
            }

            // Remove the item from the local state
            setCartItems(cartItems.filter((item) => item.id !== cartItemId));
        } catch (error) {
            console.error("Sepetten çıkarma hatası:", error);
            alert(error instanceof Error ? error.message : "Bir hata oluştu");
        } finally {
            setIsDeleting(null);
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.priceforoneItem * item.added_amount), 0);
    };

    if (isLoading) {
        return (
            <div className="flex h-screen relative">
                <Sidebar onExpand={setIsSidebarExpanded} />
                <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarExpanded ? "ml-64" : "ml-20"}`}>
                    <div className="p-6 max-w-7xl mx-auto">
                        <div className="text-center">Yükleniyor...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen relative">
            <Sidebar onExpand={setIsSidebarExpanded} />
            <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarExpanded ? "ml-64" : "ml-20"}`}>
                <div className="p-6 max-w-7xl mx-auto">
                    <h1 className="text-4xl font-semibold text-center mb-6">Sepetim</h1>

                    {cartItems.length > 0 ? (
                        <div className="space-y-4">
                            {cartItems.map((item) => (
                                <div key={item.id} className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
                                    {item.product.imageURL && (
                                        <div className="relative w-20 h-20">
                                            <Image
                                                src={item.product.imageURL}
                                                alt={item.product.title}
                                                fill
                                                className="object-cover rounded"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold">{item.product.title}</h3>
                                        <p className="text-gray-600">{item.product.description}</p>
                                        <p className="text-gray-600">Birim Fiyat: ${item.priceforoneItem}</p>
                                        <p className="text-gray-600">Adet: {item.added_amount}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-lg font-semibold">
                                            ${(item.priceforoneItem * item.added_amount).toFixed(2)}
                                        </div>
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            disabled={isDeleting === item.id}
                                            className="p-2 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                                            title="Sepetten Çıkar"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div className="bg-white p-4 rounded-lg shadow mt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-semibold">Toplam:</span>
                                    <span className="text-xl font-semibold">${calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">Sepetiniz boş.</p>
                    )}
                </div>
            </div>
            {session && <UserInfo session={session} />}
        </div>
    );
}
