import { Product } from '@/types'; // Assuming you have a Product type

export const checkIfUserIsSellerOfProduct = async (
    productId: string | string[] | undefined,
    userId: number
  ): Promise<boolean> => {
    try {
      if (!productId || Array.isArray(productId)) {
        console.warn("Invalid productId:", productId);
        return false;
      }
  
      const productRes = await fetch(`/api/products/${productId}`);
      if (!productRes.ok) {
        // If product not found (404), user is definitely not the seller
        if (productRes.status === 404) return false;
        throw new Error("Failed to fetch product data");
      }
  
      const productData: Product = await productRes.json();
      return Number(userId) === productData.userID;
    } catch (err) {
      console.error("Error in access check:", err);
      return false;
    }
  };
  