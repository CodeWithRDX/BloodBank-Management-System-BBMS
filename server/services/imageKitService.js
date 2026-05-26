import ImageKit from '@imagekit/nodejs';
import fs from 'fs';
import path from 'path';

let imagekitClient = null;

// Initialize ImageKit client if all required env vars are present
const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

if (publicKey && privateKey && urlEndpoint) {
  imagekitClient = new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint,
  });
  console.log('✅ ImageKit client initialized successfully');
} else {
  console.warn('⚠️  ImageKit credentials not configured — falling back to local disk storage for uploads');
}

/**
 * Upload a file to ImageKit (cloud) or fall back to local storage.
 *
 * @param {string} filePath  - Absolute path to the file on local disk (from Multer)
 * @param {string} fileName  - Desired file name
 * @param {string} folder    - ImageKit folder path (e.g. '/bbms/avatars')
 * @returns {Promise<{ url: string, fileId: string, provider: 'imagekit' | 'local' }>}
 */
export const uploadFile = async (filePath, fileName, folder = '/bbms') => {
  // Fallback: if ImageKit is not configured, keep the local file as-is
  if (!imagekitClient) {
    const localUrl = `/uploads/${path.basename(filePath)}`;
    return {
      url: localUrl,
      fileId: '',
      provider: 'local',
    };
  }

  try {
    // Read file from local disk into a buffer
    const fileBuffer = fs.readFileSync(filePath);

    // Upload to ImageKit using the new @imagekit/nodejs SDK
    const response = await imagekitClient.files.upload({
      file: fileBuffer,
      fileName,
      folder,
      useUniqueFileName: true,
    });

    // Remove the temporary local file after successful cloud upload
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkErr) {
      console.warn(`Could not remove temp file ${filePath}:`, unlinkErr.message);
    }

    return {
      url: response.url,
      fileId: response.fileId,
      provider: 'imagekit',
    };
  } catch (error) {
    console.error('ImageKit upload failed, keeping local file:', error.message);
    // Graceful degradation: return local path on upload failure
    const localUrl = `/uploads/${path.basename(filePath)}`;
    return {
      url: localUrl,
      fileId: '',
      provider: 'local',
    };
  }
};

/**
 * Delete a file from ImageKit by its fileId.
 *
 * @param {string} fileId - The ImageKit file ID to delete
 * @returns {Promise<boolean>}
 */
export const deleteFile = async (fileId) => {
  if (!imagekitClient || !fileId) return false;

  try {
    await imagekitClient.files.delete(fileId);
    return true;
  } catch (error) {
    console.error('ImageKit delete failed:', error.message);
    return false;
  }
};

export default { uploadFile, deleteFile };
