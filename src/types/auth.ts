import { auth } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

// Kullanıcı girişi fonksiyonu
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Giriş başarılı:", userCredential.user);
  } catch (error) {
    console.error("Giriş hatası:", error);
  }
};

// Yeni kullanıcı kaydı fonksiyonu
export const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Kullanıcı kaydedildi:", userCredential.user);
  } catch (error) {
    console.error("Kayıt hatası:", error);
  }
};
