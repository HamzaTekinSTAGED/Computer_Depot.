import { User } from '../types/user';
import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { FiX } from 'react-icons/fi';

interface EditUserModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: Partial<User>) => void;
}

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '500px',
    maxWidth: '90%',
    borderRadius: '8px',
    padding: '24px',
  },
};

// Ensure Modal is properly initialized for accessibility
// You might want to set this at the root of your application
// Modal.setAppElement('#__next'); // Example for Next.js

export const EditUserModal = ({ user, isOpen, onClose, onSave }: EditUserModalProps) => {
  const [formData, setFormData] = useState({
    name: user.name,
    surname: user.surname,
    email: user.email,
    role: user.role,
  });

  // Reset form data when user changes or modal opens
  // This prevents stale data if the modal is reused for different users
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isOpen]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Only pass fields that are part of the form to onSave
    const updatedFields: Partial<User> = {
      name: formData.name,
      surname: formData.surname,
      email: formData.email,
      role: formData.role,
    };
    onSave(updatedFields);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel="Edit User Modal"
      // Add appElement for accessibility if not set globally
      // appElement={typeof window !== 'undefined' ? document.getElementById('__next') : undefined} 
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Edit User</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <FiX size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label htmlFor="surname" className="block text-sm font-medium text-gray-700">Surname</label>
          <input
            id="surname"
            type="text"
            name="surname"
            value={formData.surname}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Optional: Export default if it's the primary export
// export default EditUserModal; 