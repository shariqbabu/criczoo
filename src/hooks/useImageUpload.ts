import { useState, useCallback } from 'react';
import { uploadToCloudinary, type UploadFolder } from '@/services/cloudinaryService';
import { useAuth } from '@/contexts/AuthContext';

interface UploadState {
  uploading: boolean;
  progress: number;
  url: string | null;
  publicId: string | null;
  error: string | null;
}

export function useImageUpload(folder: UploadFolder) {
  const { user } = useAuth();
  const [state, setState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    url: null,
    publicId: null,
    error: null,
  });

  const upload = useCallback(
    async (file: File): Promise<{ url: string; publicId: string } | null> => {
      if (!user) { setState((s) => ({ ...s, error: 'Not authenticated' })); return null; }

      const token = await user.getIdToken();
      setState({ uploading: true, progress: 0, url: null, publicId: null, error: null });

      try {
        const result = await uploadToCloudinary(file, folder, token, (progress) => {
          setState((s) => ({ ...s, progress }));
        });

        setState({
          uploading: false,
          progress: 100,
          url: result.secure_url,
          publicId: result.public_id,
          error: null,
        });

        return { url: result.secure_url, publicId: result.public_id };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        setState({ uploading: false, progress: 0, url: null, publicId: null, error: message });
        return null;
      }
    },
    [user, folder]
  );

  const reset = useCallback(() => {
    setState({ uploading: false, progress: 0, url: null, publicId: null, error: null });
  }, []);

  return { ...state, upload, reset };
}
