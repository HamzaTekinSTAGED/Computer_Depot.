import React, { useRef, useState } from 'react';

interface ProfilePhotoProps {
  image?: string | null;
  onImageChange?: (file: File) => void;
}

const DEFAULT_AVATAR = '/default-avatar-400x400.png';

const ProfilePhoto: React.FC<ProfilePhotoProps> = ({ image, onImageChange }) => {
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageChange?.(e.target.files[0]);
    }
  };

  return (
    <div
      className="relative w-16 h-16 rounded-full overflow-hidden cursor-pointer group border "
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handlePhotoClick}
      title="Change profile photo"
    >
      <img
        src={image || DEFAULT_AVATAR}
        alt="Profile"
        className="w-full h-full object-cover"
      />
      {isHovering && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-xs font-semibold transition-all">
          Edit
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ProfilePhoto; 