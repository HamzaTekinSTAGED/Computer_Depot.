export const checkIfUserIsSellerOfProduct = async (
    productId: string | string[] | undefined,
    userId: number
  ): Promise<boolean> => {
    try {
      if (!productId || Array.isArray(productId)) {
        console.warn("Invalid productId:", productId);
        return false;
      }
  
      const res = await fetch(`/api/trade/seller-of-product/${productId}`);
      if (!res.ok) throw new Error("Failed to fetch seller data");
  
      const data = await res.json();
      return Number(userId) === data.sellerID;
    } catch (err) {
      console.error("Error in access check:", err);
      return false;
    }
  };
  