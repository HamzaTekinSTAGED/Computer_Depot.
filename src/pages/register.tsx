"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {BackgroundPaths} from "../components/background-paths";
import { useSession, signIn } from "next-auth/react";
import { FormData } from "@/types";
import { useAuthCheck } from "@/functions/functions";

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useAuthCheck(status, setIsLoading);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validasyon
    if (!formData.username || !formData.name || !formData.surname || !formData.email || !formData.password) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    try {
      setIsLoading(true);

      // Yeni API endpoint'imize veri gönder
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kayıt işlemi başarısız oldu.');
      }

      console.log("Kullanıcı başarıyla kaydedildi!", data);
      
      // Kayıt başarılıysa otomatik giriş yap
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/login?registered=true");
      } else {
        router.push("/hero");
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Kayıt hatası:', err);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="relative min-h-screen">
        <BackgroundPaths title="Register" showTitle={false} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <BackgroundPaths title="Register" showTitle={false} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-black/20">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/logo-clean.png"
              alt="Logo"
              width={64}
              height={64}
              className="h-16 object-contain"
            />
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <form onSubmit={handleRegister}>
            {/* Username Input */}
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full mb-4 px-4 py-3 rounded-lg border border-black/30 bg-white/50 text-black placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-black/60 focus:bg-white/70"
            />

            {/* Name Input */}
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full mb-4 px-4 py-3 rounded-lg border border-black/30 bg-white/50 text-black placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-black/60 focus:bg-white/70"
            />

            {/* Surname Input */}
            <input
              type="text"
              name="surname"
              placeholder="Surname"
              value={formData.surname}
              onChange={handleChange}
              className="w-full mb-4 px-4 py-3 rounded-lg border border-black/30 bg-white/50 text-black placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-black/60 focus:bg-white/70"
            />

            {/* Email Input */}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full mb-4 px-4 py-3 rounded-lg border border-black/30 bg-white/50 text-black placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-black/60 focus:bg-white/70"
            />

            {/* Password Input */}
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full mb-4 px-4 py-3 rounded-lg border border-black/30 bg-white/50 text-black placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-black/60 focus:bg-white/70"
            />

            {/* Confirm Password Input */}
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword || ""}
              onChange={handleChange}
              className="w-full mb-4 px-4 py-3 rounded-lg border border-black/30 bg-white/50 text-black placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-black/60 focus:bg-white/70"
            />

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-300"
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
          </form>

          
          {/* Login Redirect */}
          <p className="text-center text-black text-sm mt-6">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-indigo-600 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
