import { FC, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";

interface UserInfoProps {
  session: Session;
}

const UserInfo: FC<UserInfoProps> = ({ session }) => {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/login");
    } catch (error) {
      console.error("Logout error: ", error);
    }
  };

  const handlePasswordChange = () => {
    router.push("/password-change");
  };

  const user = session.user;

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center space-x-2 text-blue-600 font-semibold focus:outline-none"
        aria-label="User menu"
      >
        <span>{user.email}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
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

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg p-2 z-10">
          <div className="text-gray-700">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 rounded-md"
              aria-label="Logout"
            >
              Logout
            </button>
            <button
              onClick={handlePasswordChange}
              className="w-full text-left px-4 py-2 text-blue-500 hover:bg-gray-100 rounded-md"
              aria-label="Change Password"
            >
              Change Password
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInfo;
