import { User } from '../types/user';

export const editUser = async (user: User, onSave: (updatedUser: Partial<User>) => Promise<void>) => {
  
  // Ensure we only send the necessary fields to the API
  const { userID, name, surname, email, role } = user;
  const payload = { name, surname, email, role };

  try {
    const response = await fetch(`/api/users/${userID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload), // Send only the updated fields
    });

    const data = await response.json();

    if (!response.ok) {
      // Pass the error message from the API response if available
      throw new Error(data.error || 'Failed to update user');
    }

    // Pass the updated user data (without password) back to the callback
    await onSave(data); 


  } catch (error) {
    console.error('Error editing user:', error);
    // Re-throw the error so the calling component can handle it (e.g., show an error message)
    throw error; 
  }
};
