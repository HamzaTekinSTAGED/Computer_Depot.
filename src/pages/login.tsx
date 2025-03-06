"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";  // useRouter hook'u
import { signIn } from "../types/auth";  // Firebase authentication fonksiyonu

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter(); // useRouter hook'u

  const handleLogin = async () => {
    try {
      await signIn(email, password);  // Firebase ile giriş yapıyoruz
      router.push("/hero");  // Giriş başarılı olduğunda /hero rotasına yönlendiriyoruz
    } catch (error) {
      console.error("Giriş hatası: ", error);  // Hata yönetimi
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Giriş Yap</h1>
        
        <div className="space-y-4">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          onClick={handleLogin}
          className="w-full mt-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300"
        >
          Giriş Yap
        </button>
      </div>
    </div>
  );
}
