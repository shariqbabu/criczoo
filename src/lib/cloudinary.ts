const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

export const uploadToCloudinary = async (
  file: File,
  folder = 'cricarena'
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    throw new Error('Cloudinary upload failed');
  }

  const data = await res.json() as { secure_url: string };
  return data.secure_url;
};

export const getCloudinaryUrl = (
  publicId: string,
  options: { width?: number; height?: number; quality?: string } = {}
) => {
  const { width = 400, height = 400, quality = 'auto' } = options;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_${width},h_${height},c_fill,q_${quality}/${publicId}`;
};
