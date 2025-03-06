"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import app from "../firebase";
export default function RegisterPage() {
  const auth = getAuth(app);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("Kullanıcı başarıyla kaydedildi!");
      router.push("/login"); // Kayıt başarılıysa login sayfasına yönlendir
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Kayıt Ol</h2>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleRegister} className="flex flex-col">
          <input
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 mb-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 mb-2 rounded"
            required
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Kayıt Ol
          </button>
        </form>
        <p className="mt-4 text-sm">
          Zaten bir hesabın var mı?{" "}
          <a href="/login" className="text-blue-500">
            Giriş Yap
          </a>
        </p>
      </div>
    </div>
  );
}
