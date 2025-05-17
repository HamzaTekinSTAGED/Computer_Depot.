import { MouseEventHandler } from "react";
import 'next-auth';

interface CommentUser {
  username: string;
  image: string | null;
}

// This interface should align with the actual data structure from the API
export interface CommentData { // Exporting for use in parent component
  id?: number; // Added optional id if available from API
  userId: number;
  productId: number;
  star: number;
  comment: string | null;
  getLiked?: number; // Optional fields
  photo?: string | null; // Optional fields
  createdAt: string; // Keep as string for simplicity, format later if needed
  user: CommentUser;
  replies?: ReplyData[]; // Optional array of replies
  currentUserLiked?: boolean; // Indicates if the current session user has liked this comment
}

export interface ReplyData {
  replyID: number;
  commentUser: number;
  commentProduct: number;
  userID: number;
  text: string;
  createdAt: string; // Keep as string for simplicity
  updatedAt: string; // Keep as string for simplicity
  user: CommentUser; // User who made the reply (seller)
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  added_amount: number;
  priceforoneItem: number;
  product: {
      title: string;
      imageURL: string | null;
      description: string;
      maxBuyAmount: number;
      amount: number;
  };
}

export interface Product {
  title: string;
  categoryID: number;
  category: {
    name: string;
  };
  imageURL: string;
  price: number;
  amount: number;
  maxBuyAmount: number;
  userID: number;
  productID: number;
  description: string;
  newCommentExist: boolean;
  comments?: {
    star: number;
  }[];
  publishingDate: Date; 
}

export interface TradeHistory {
  id: number;
  buyerID: number;
  sellerID: number;
  productID: number;
  price: number;
  sellingDate: string;
  product: {
    title: string;
    description: string;
    imageURL: string;
    amount: number;
    categoryID: number;
    category: {
      name: string;
    };
  };
  buyer: {
    username: string;
  };
  seller: {
    username: string;
  };
  amount: number;
}

export interface RawProduct {
  productID: number;
  title: string;
  description: string;
  price: number;
  amount: number; // Added amount to interface
  category: string;
  imageURL: string;
  publishingDate: Date;
  userID: number;
}

export interface Category {
  categoryID: number;
  name: string;
  description: string | null;
}

export interface ProductPopupProps {
  product: Product;
  onClose: () => void;
  onPurchase: (productId: number) => Promise<void>;
  isPurchasing: boolean;
  isOwner?: boolean;
}

export interface CustomButtonProps {
    title: string;
    containerStyles?: string;
    handleClick?: MouseEventHandler<HTMLButtonElement>;
    btnType?: "button" | "submit";
    textStyles?: string; 
    rightIcon?: string;
    isDisabled?: boolean;
}

export interface FormData {
    username: string;
    name: string;
    surname: string;
    email: string;
    password: string;
    confirmPassword?: string;
}

export interface Router {
  push: (path: string) => void;
}

export interface Favorite {
  userId: number;
  productId: number;
  product: Product; // Include product details
}