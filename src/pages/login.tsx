"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "../types/auth";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signIn(email, password);
      router.push("/hero");
    } catch (error) {
      console.error("Giriş hatası: ", error);
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
          <Image
            src="/logo-clean.png"
            alt="Logo"
            width={64}
            height={64}
            className="h-16 object-contain"
          />
        </div>

        {/* Başlık */}
        <h1 className="text-2xl font-bold text-white text-center mb-4">Login</h1>

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

        {/* Forgot Password */}
        <div className="text-right mb-4">
          <Link href="#" className="text-sm text-white hover:underline">Forgot Password?</Link>
        </div>

        {/* Sign In Button */}
        <button
          onClick={handleLogin}
          className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-300"
        >
          Sign in
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
            <Image src="/google-icon.svg" alt="Google" width={24} height={24} className="h-6 w-6" />
          </button>
        </div>

        {/* Register */}
        <p className="text-center text-white text-sm mt-6">
          Don't have an account?{" "}
          <Link href="/" className="font-medium hover:underline">Register for free</Link>
        </p>
      </div>
    </div>
  );
}
