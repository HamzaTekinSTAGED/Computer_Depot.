export const uploadToCloudinary = async (file: File): Promise<string> => {
  try {
    console.log('Starting Cloudinary upload for file:', file.name);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'computer_depot'); // You'll need to create this in Cloudinary dashboard

    const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
    console.log('Uploading to:', uploadUrl);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Cloudinary upload failed:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(`Failed to upload image to Cloudinary: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Cloudinary upload successful:', {
      url: data.secure_url,
      publicId: data.public_id
    });
    
    return data.secure_url;
  } catch (error) {
    console.error('Error in uploadToCloudinary:', error);
    throw error;
  }
}; 