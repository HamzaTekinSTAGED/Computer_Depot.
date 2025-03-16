import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";

// Bu dosya eski Firebase yöntemlerinden NextAuth.js'e geçiş için basit bir uyumluluk katmanı sağlar

// Kullanıcı girişi fonksiyonu - NextAuth'a yönlendirir
export const signIn = async (email: string, password: string) => {
  try {
    const result = await nextAuthSignIn("credentials", {
      email,
      password,
      redirect: false,
    });
    
    if (result?.error) {
      throw new Error(result.error);
    }
    
    return result;
  } catch (error) {
    console.error("Giriş hatası:", error);
    throw error;
  }
};

// Çıkış fonksiyonu
export const signOut = async () => {
  try {
    await nextAuthSignOut({ redirect: false });
  } catch (error) {
    console.error("Çıkış hatası:", error);
    throw error;
  }
};
