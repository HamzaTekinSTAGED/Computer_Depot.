"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import bcrypt from "bcrypt";

export default function PasswordChangePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Oturum kontrolü
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validasyonlar
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Yeni şifreler eşleşmiyor.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    try {
      setIsLoading(true);

      if (!session?.user?.email) {
        throw new Error("Oturum bilgisi bulunamadı.");
      }

      // Kullanıcının mevcut şifresini doğrula
      const verifyResponse = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email,
          password: currentPassword
        }),
      });

      if (!verifyResponse.ok) {
        const data = await verifyResponse.json();
        throw new Error(data.error || "Mevcut şifre doğrulanamadı.");
      }

      // Şifreyi veritabanında güncelle
      const updateResponse = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email,
          newPassword: newPassword
        }),
      });

      if (!updateResponse.ok) {
        const data = await updateResponse.json();
        throw new Error(data.error || "Şifre güncellenirken bir hata oluştu.");
      }

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Başarılı olduğunda 2 saniye sonra hero sayfasına yönlendir
      setTimeout(() => {
        router.push("/hero");
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Beklenmeyen bir hata oluştu');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Yükleniyor durumu
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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

        {/* Title */}
        <h1 className="text-2xl font-bold text-white text-center mb-4">Change Password</h1>

        {/* Error Message */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Success Message */}
        {success && <p className="text-green-500 text-center mb-4">Password updated successfully!</p>}

        <form onSubmit={handlePasswordChange}>
          {/* Current Password Input */}
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded-lg border border-white/30 bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-white/60 focus:bg-white/30"
          />

          {/* New Password Input */}
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded-lg border border-white/30 bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-white/60 focus:bg-white/30"
          />

          {/* Confirm New Password Input */}
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded-lg border border-white/30 bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-white/60 focus:bg-white/30"
          />

          {/* Change Password Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-300 disabled:opacity-70"
          >
            {isLoading ? "Processing..." : "Change Password"}
          </button>
        </form>

        {/* Go back to profile */}
        <div className="text-center mt-4">
          <p className="text-white text-sm">
            <Link href="/hero" className="text-indigo-500 hover:underline">Back to Profile</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
