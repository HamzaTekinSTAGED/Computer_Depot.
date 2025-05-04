"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar";
import UserInfo from "../../components/UserInfo";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import LoadingSpinner from "../../components/loading";
import { CartItem } from "@/types";

export default function CartPage() {
    const { data: session } = useSession();
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [purchaseError, setPurchaseError] = useState<string | null>(null);
    const [purchaseSuccess, setPurchaseSuccess] = useState(false);
    const [isUpdatingQuantity, setIsUpdatingQuantity] = useState<number | null>(null);

    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                const res = await fetch("/api/cart");
                if (!res.ok) {
                    throw new Error("Failed to fetch cart content.");
                }
                const data = await res.json();
                setCartItems(data);
            } catch (error) {
                console.error("Cart error:", error);
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
                throw new Error("Failed to remove item from cart.");
            }

            // Remove the item from the local state
            setCartItems(cartItems.filter((item) => item.id !== cartItemId));
        } catch (error) {
            console.error("Remove from cart error:", error);
            alert(error instanceof Error ? error.message : "An error occurred");
        } finally {
            setIsDeleting(null);
        }
    };

    const handleUpdateQuantity = async (cartItemId: number, newQuantity: number) => {
        try {
            setIsUpdatingQuantity(cartItemId);
            const response = await fetch("/api/cart", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ cartItemId, quantity: newQuantity }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to update quantity");
            }

            // Update the local state
            setCartItems(cartItems.map(item => 
                item.id === cartItemId 
                    ? { ...item, added_amount: newQuantity }
                    : item
            ));
        } catch (error) {
            console.error("Update quantity error:", error);
            alert(error instanceof Error ? error.message : "An error occurred");
        } finally {
            setIsUpdatingQuantity(null);
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.priceforoneItem * item.added_amount), 0);
    };

    const handlePurchase = async () => {
        setIsPurchasing(true);
        setPurchaseError(null);
        setPurchaseSuccess(false);
        try {
            for (const item of cartItems) {
                // Her bir ürün için tek bir trade-history kaydı oluştur
                const tradeRes = await fetch("/api/trade-history", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        productId: item.product_id,
                        amount: item.added_amount
                    }),
                });
                if (!tradeRes.ok) {
                    const err = await tradeRes.json();
                    throw new Error(err.error || "Purchase failed.");
                }

                // Ürün miktarını güncelle
                const updateRes = await fetch("/api/products", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        productId: item.product_id,
                        amount: item.added_amount
                    }),
                });
                if (!updateRes.ok) {
                    throw new Error("Failed to update product amount.");
                }

                // Sepetten sil
                const deleteRes = await fetch("/api/cart", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cartItemId: item.id }),
                });
                if (!deleteRes.ok) {
                    throw new Error("Failed to remove item from cart.");
                }
            }
            setCartItems([]);
            setPurchaseSuccess(true);
        } catch (error) {
            setPurchaseError(error instanceof Error ? error.message : "An error occurred");
        } finally {
            setIsPurchasing(false);
        }
    };

    return (
        <div className="flex h-screen relative">
            <Sidebar onExpand={setIsSidebarExpanded} />
            <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarExpanded ? "ml-64" : "ml-20"}`}>
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <div className="p-6 max-w-7xl mx-auto">
                        <h1 className="text-4xl font-semibold text-center mb-6">My Cart</h1>

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
                                            <div className="flex items-center space-x-2">
                                                <span className="text-gray-600">Adet:</span>
                                                <div className="flex items-center border rounded-md">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id, item.added_amount - 1)}
                                                        disabled={isUpdatingQuantity === item.id || item.added_amount <= 1}
                                                        className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="px-3 py-1">{item.added_amount}</span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id, item.added_amount + 1)}
                                                        disabled={isUpdatingQuantity === item.id || item.added_amount >= Math.min(item.product.maxBuyAmount, item.product.amount)}
                                                        className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    (Max: {Math.min(item.product.maxBuyAmount, item.product.amount)})
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-lg font-semibold">
                                                ${(item.priceforoneItem * item.added_amount).toFixed(2)}
                                            </div>
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                disabled={isDeleting === item.id}
                                                className="p-2 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                                                title="Remove from Cart"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <div className="bg-white p-4 rounded-lg shadow mt-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xl font-semibold">Total:</span>
                                        <span className="text-xl font-semibold">${calculateTotal().toFixed(2)}</span>
                                    </div>
                                    <button
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
                                        onClick={handlePurchase}
                                        disabled={isPurchasing}
                                    >
                                        {isPurchasing ? "Purchasing..." : "Purchase"}
                                    </button>
                                    {purchaseError && (
                                        <div className="text-red-500 text-center mt-2">{purchaseError}</div>
                                    )}
                                    {purchaseSuccess && (
                                        <div className="text-green-600 text-center mt-2">Purchase successful!</div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500">Your cart is empty.</p>
                        )}
                    </div>
                )}
            </div>
            {session && <UserInfo session={session} />}
        </div>
    );
}
