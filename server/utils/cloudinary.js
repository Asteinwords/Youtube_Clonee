import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Debug: Log configuration (hide secret)
console.log('Cloudinary Config:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET ? '***configured***' : 'MISSING'
});

/**
 * Upload video to Cloudinary
 * @param {string} filePath - Path to the video file
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<Object>} - Upload result with URL and public_id
 */
export const uploadVideo = async (filePath, folder = 'youtube-clone/videos') => {
    try {
        console.log('Attempting Cloudinary upload with:', {
            filePath,
            folder,
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME
        });

        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: 'video',
            folder: folder
        });

        console.log('Upload successful:', result.secure_url);
        console.log('Raw duration from Cloudinary:', result.duration);

        // Sanitize duration - Cloudinary returns duration in seconds as a float
        let duration = 0;
        if (result.duration && !isNaN(result.duration)) {
            duration = Math.floor(Number(result.duration));
        }

        return {
            url: result.secure_url,
            publicId: result.public_id,
            duration: duration,
            format: result.format
        };
    } catch (error) {
        console.error('Cloudinary video upload error:', error);
        console.error('Full error details:', JSON.stringify(error, null, 2));
        throw new Error('Failed to upload video: ' + error.message);
    }
};

/**
 * Upload image to Cloudinary
 * @param {string} filePath - Path to the image file
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<Object>} - Upload result with URL and public_id
 */
export const uploadImage = async (filePath, folder = 'youtube-clone/images') => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: 'image',
            folder: folder,
            transformation: [
                { width: 1280, height: 720, crop: 'fill' }
            ]
        });

        return {
            url: result.secure_url,
            publicId: result.public_id
        };
    } catch (error) {
        console.error('Cloudinary image upload error:', error);
        throw new Error('Failed to upload image');
    }
};

/**
 * Delete resource from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - 'image' or 'video'
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteResource = async (publicId, resourceType = 'image') => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
        return result;
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error('Failed to delete resource');
    }
};

export default cloudinary;
