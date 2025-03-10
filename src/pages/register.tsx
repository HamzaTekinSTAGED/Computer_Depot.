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
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/login-background-blue.jpg')" }}
    >
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo-clean.png"
            alt="Logo"
            className="h-16 object-contain"
          />
        </div>

        {/* Başlık */}
        <h1 className="text-2xl font-bold text-white text-center mb-4">Register</h1>

        {/* Error Message */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Email Input */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-lg border border-white/30 bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-white/60 focus:bg-white/30"
        />

        {/* Password Input */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-lg border border-white/30 bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-white/60 focus:bg-white/30"
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
          <div className="flex-grow border-t border-white/30"></div>
          <span className="mx-4 text-white">or continue with</span>
          <div className="flex-grow border-t border-white/30"></div>
        </div>

        {/* Social Buttons */}
        <div className="flex justify-center space-x-4">
          <button className="flex items-center justify-center w-12 h-12 bg-white/0 border border-white/30 rounded-full hover:bg-white/30 transition">
            <img src="/google-icon.svg" alt="Google" className="h-6 w-6" />
          </button>
        </div>

        {/* Login Redirect */}
        <p className="text-center text-white text-sm mt-6">
          Already have an account?{" "}
          <a href="/login" className="font-medium hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}
