"use client";

import { useRouter } from "next/navigation";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../firebase";
import Navbar from "../components/Navbar";

const HeroPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showLogout, setShowLogout] = useState(false);

  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/register");
      } else {
        setUser(user);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/register");
    } catch (error) {
      console.error("Logout hatası: ", error);
    }
  };



  return (
    <div className="flex h-screen relative">
      {/* Navbar */}
      <Navbar />

      {/* Sayfa içeriği */}
      <main className="flex-1 ml-20 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold">Find, best tech equipments - quickly and easily!</h1>
        
       
      </main>

      {/* Kullanıcı Bilgisi */}
      {user && (
        <div className="absolute top-4 right-4">
          <button onClick={() => setShowLogout(!showLogout)} className="text-blue-600 font-medium">
            {user.email}
          </button>
          {showLogout && (
            <button
              onClick={handleLogout}
              className="absolute right-6 mt-6 bg-red-500 text-white rounded p-1 shadow-lg"
            >
              Logout
            </button>
          )}
        </div>

        

      )}


    </div>
  );
};

export default HeroPage;
