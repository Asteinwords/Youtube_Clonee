// Test Cloudinary Configuration
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

console.log('=== Cloudinary Configuration Test ===');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('Cloud Name Length:', process.env.CLOUDINARY_CLOUD_NAME?.length);
console.log('Cloud Name (JSON):', JSON.stringify(process.env.CLOUDINARY_CLOUD_NAME));
console.log('API Key:', process.env.CLOUDINARY_API_KEY);
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? `${process.env.CLOUDINARY_API_SECRET.substring(0, 5)}...` : 'MISSING');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test the connection
try {
    const result = await cloudinary.api.ping();
    console.log('✓ Cloudinary connection successful!');
    console.log('Response:', result);
} catch (error) {
    console.error('✗ Cloudinary connection failed!');
    console.error('Error:', error.message);
    console.error('Full error:', error);
}
