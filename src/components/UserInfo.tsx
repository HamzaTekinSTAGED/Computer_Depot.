import { FC, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Session } from "next-auth";
import Cart from "./Cart";
import ProfilePhoto from "./profilePhoto";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";

interface UserInfoProps {
  session: Session;
}

const UserInfo: FC<UserInfoProps> = ({ session }) => {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const user = session.user;
  const [profileImage, setProfileImage] = useState<string | null | undefined>(user.image);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setProfileImage(session.user.image);
  }, [session.user.image]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/Authentication/login");
    } catch (error) {
      console.error("Logout error: ", error);
    }
  };

  const handlePasswordChange = () => {
    router.push("/Authentication/password-change");
  };

  const handleProfilePhotoChange = async (file: File) => {
    setIsUploading(true);
    try {
      console.log('Starting profile photo upload process...');
      // Upload to Cloudinary
      const url = await uploadToCloudinary(file);
      console.log('Cloudinary upload successful, URL:', url);
      
      // Update user's image in database
      console.log('Attempting to update database with new image URL...');
      const response = await fetch('/api/users/update-image', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: url }),
      });

      console.log('Database update response status:', response.status);
      const responseData = await response.json();
      console.log('Database update response:', responseData);

      if (!response.ok) {
        throw new Error(`Failed to update profile image in database: ${responseData.message}`);
      }

      // Update the session with new image URL
      await updateSession({
        ...session,
        user: {
          ...session.user,
          image: url
        }
      });

      setProfileImage(url);
      console.log('Profile photo update completed successfully');
    } catch (err) {
      console.error('Detailed error in profile photo update:', err);
      alert("Fotoğraf yüklenirken hata oluştu: " + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleAdminDashboard = () => {
    router.push("/admin");
  };

  return (
    <div className="fixed top-4 right-4 flex items-center space-x-4">
      {/* Profil Fotoğrafı */}
      <ProfilePhoto image={profileImage} onImageChange={handleProfilePhotoChange} />
      {/* Cart bileşeni */}
      <div className="mr-4">
        <Cart />
      </div>
      
      {/* User Info */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white hover:bg-gray-50 transition-colors duration-200 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="User menu"
        >
          <span className="text-base font-medium">{user.username}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 transition-transform duration-200 ${showMenu ? 'transform rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <div
          className={`absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-200 ease-in-out ${
            showMenu ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}
        >
          <div className="py-1">
            {user.role === "ADMIN" && (
              <button
                onClick={handleAdminDashboard}
                className="w-full text-left px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors duration-150 flex items-center space-x-2"
                aria-label="Admin Dashboard"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Admin Dashboard</span>
              </button>
            )}
            <button
              onClick={handlePasswordChange}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 flex items-center space-x-2"
              aria-label="Change Password"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
              <span>Change Password</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 flex items-center space-x-2"
              aria-label="Logout"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
