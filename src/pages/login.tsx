"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BackgroundPaths } from "../components/background-paths";
import { signIn, useSession } from "next-auth/react";
import { useAuthCheck } from "@/functions/functions";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session, status } = useSession();

  useAuthCheck(status, setIsLoading);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Lütfen e-posta ve şifrenizi girin.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Geçersiz e-posta veya şifre.");
        setIsLoading(false);
      } else {
        router.push("/hero");
      }
    } catch (error) {
      setError("Giriş yapılırken bir hata oluştu.");
      console.error("Giriş hatası: ", error);
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="relative min-h-screen">
        <BackgroundPaths title="Login" showTitle={false} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <BackgroundPaths title="Login" showTitle={false} />
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

          {/* Başlık */}
          <h1 className="text-2xl font-bold text-black text-center mb-4">Login</h1>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex">
                <div>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            {/* Email Input */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-4 px-4 py-3 rounded-lg border border-black/30 bg-white/50 text-black placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-black/60 focus:bg-white/70"
            />

            {/* Password Input */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-4 px-4 py-3 rounded-lg border border-black/30 bg-white/50 text-black placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-black/60 focus:bg-white/70"
            />

            {/* Forgot Password */}
            <div className="text-right mb-4">
              <Link href="/forgetpassw" className="text-sm text-black hover:underline">Forgot Password?</Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-300"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Or continue with */}
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-black/30"></div>
            <span className="mx-4 text-black">or continue with</span>
            <div className="flex-grow border-t border-black/30"></div>
          </div>

          {/* Social Buttons */}
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => signIn("google", { callbackUrl: "/hero" })}
              className="flex items-center justify-center w-12 h-12 bg-white/50 border border-black/30 rounded-full hover:bg-white/70 transition"
            >
              <Image src="/google-icon.svg" alt="Google" width={24} height={24} className="h-6 w-6" />
            </button>
          </div>

          {/* Register */}
          <p className="text-center text-black text-sm mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/" className="font-medium text-indigo-600 hover:underline">Register for free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
