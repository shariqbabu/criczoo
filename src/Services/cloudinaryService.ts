const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

export type UploadFolder = 'team-logos' | 'team-banners' | 'player-photos' | 'tournament-posters' | 'avatars';

export async function getUploadSignature(
  folder: UploadFolder,
  authToken: string
): Promise<{ signature: string; timestamp: number; cloudName: string; apiKey: string; folder: string }> {
  const res = await fetch(`${API_BASE}/upload/signature`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
    body: JSON.stringify({ folder }),
  });
  if (!res.ok) throw new Error('Failed to get upload signature');
  return res.json();
}

export async function uploadToCloudinary(
  file: File,
  folder: UploadFolder,
  authToken: string,
  onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResult> {
  const sig = await getUploadSignature(folder, authToken);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', sig.apiKey);
  formData.append('timestamp', sig.timestamp.toString());
  formData.append('signature', sig.signature);
  formData.append('folder', sig.folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error('Upload failed: Network error'));
    xhr.send(formData);
  });
}

export function getCloudinaryUrl(
  publicId: string,
  transformations?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: number | 'auto';
    format?: string;
  }
): string {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const base = `https://res.cloudinary.com/${cloudName}/image/upload`;

  if (!transformations) return `${base}/${publicId}`;

  const parts: string[] = [];
  if (transformations.width) parts.push(`w_${transformations.width}`);
  if (transformations.height) parts.push(`h_${transformations.height}`);
  if (transformations.crop) parts.push(`c_${transformations.crop}`);
  if (transformations.quality) parts.push(`q_${transformations.quality}`);
  if (transformations.format) parts.push(`f_${transformations.format}`);

  const t = parts.join(',');
  return `${base}/${t}/${publicId}`;
}
