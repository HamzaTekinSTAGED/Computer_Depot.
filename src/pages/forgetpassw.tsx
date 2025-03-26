"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BackgroundPaths } from "../components/background-paths";

export default function ForgotPasswordPage() {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    surname: "",
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validasyon
    if (!formData.username || !formData.name || !formData.surname || !formData.email || !formData.newPassword || !formData.confirmPassword) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Yeni şifreler eşleşmiyor.");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
          newPassword: formData.newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Şifre sıfırlama işlemi başarısız oldu.');
      }

      if (data.success) {
        setSuccess(true);
        // Başarılı olduğunda 2 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        throw new Error(data.error || 'Şifre sıfırlama işlemi başarısız oldu.');
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Şifre sıfırlama hatası:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <BackgroundPaths title="Forgot Password" showTitle={false} />
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

          {/* Title */}
          <h1 className="text-2xl font-bold text-black text-center mb-4">Forgot Password</h1>

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

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
              <div className="flex">
                <div>
                  <p className="text-sm text-green-700">Password reset successful! Redirecting to login...</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
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

            {/* New Password Input */}
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full mb-4 px-4 py-3 rounded-lg border border-black/30 bg-white/50 text-black placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-black/60 focus:bg-white/70"
            />

            {/* Confirm New Password Input */}
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full mb-4 px-4 py-3 rounded-lg border border-black/30 bg-white/50 text-black placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-black/60 focus:bg-white/70"
            />

            {/* Reset Password Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-300 disabled:opacity-70"
            >
              {isLoading ? "Processing..." : "Reset Password"}
            </button>
          </form>

          {/* Back to Login */}
          <div className="text-center mt-4">
            <p className="text-black text-sm">
              <Link href="/login" className="text-indigo-600 hover:underline">Back to Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
