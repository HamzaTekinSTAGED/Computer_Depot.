"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import {BackgroundPaths} from "../components/background-paths";
import Image from "next/image";
import Link from "next/link";

interface FormData {
  username: string;
  name: string;
  surname: string;
  email: string;
  password: string;
}

interface FirebaseError extends Error {
  code?: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    name: "",
    surname: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const router = useRouter();

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

    try {
      // Firebase'de kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Database'e kullanıcı bilgilerini kaydet
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
          password: formData.password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: 'Sunucu yanıt vermedi'
        }));
        throw new Error(errorData.error || 'Database kayıt hatası');
      }

      const data = await response.json();
      console.log("Kullanıcı başarıyla kaydedildi!", data);
      router.push("/login");
    } catch (err) {
      const firebaseError = err as FirebaseError;
      // Firebase authentication hatalarını daha anlaşılır hale getir
      if (firebaseError.code === 'auth/email-already-in-use') {
        setError('Bu email adresi zaten kullanımda.');
      } else if (firebaseError.code === 'auth/weak-password') {
        setError('Şifre en az 6 karakter olmalıdır.');
      } else if (firebaseError.code === 'auth/invalid-email') {
        setError('Geçersiz email adresi.');
      } else {
        setError(firebaseError.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
      }
      
      console.error('Kayıt hatası:', firebaseError);
    }
  };

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

          {/* Register Button */}
          <button
            onClick={handleRegister}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-300"
          >
            Register
          </button>

          {/* Or continue with */}
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-black/30"></div>
            <span className="mx-4 text-black">or continue with</span>
            <div className="flex-grow border-t border-black/30"></div>
          </div>

          {/* Social Buttons */}
          <div className="flex justify-center space-x-4">
            <button className="flex items-center justify-center w-12 h-12 bg-white/50 border border-black/30 rounded-full hover:bg-white/70 transition">
              <Image src="/google-icon.svg" alt="Google" width={24} height={24} className="h-6 w-6" />
            </button>
          </div>

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
