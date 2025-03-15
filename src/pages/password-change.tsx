"use client";

import { useState } from "react";
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { useRouter } from "next/navigation";
import app from "../firebase";
import Image from "next/image";
import Link from "next/link";

export default function PasswordChangePage() {
  const auth = getAuth(app);
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      const user = auth.currentUser;

      if (!user) {
        throw new Error("No user is logged in.");
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email || "", currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password in Firebase Auth
      await updatePassword(user, newPassword);

      // Update password in database
      const response = await fetch('/api/users/update-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          newPassword: newPassword
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update password in database');
      }

      setSuccess(true);
      console.log("Password updated successfully in both Auth and Database!");
      router.push("/hero"); // Redirect to profile page or another page after success
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
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

        {/* Title */}
        <h1 className="text-2xl font-bold text-white text-center mb-4">Change Password</h1>

        {/* Error Message */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Success Message */}
        {success && <p className="text-green-500 text-center mb-4">Password updated successfully!</p>}

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

        {/* Change Password Button */}
        <button
          onClick={handlePasswordChange}
          className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-300"
        >
          Change Password
        </button>

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
