import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter for videos
const videoFilter = (req, file, cb) => {
    const allowedVideoTypes = /mp4|avi|mov|wmv|flv|mkv|webm/;
    const extname = allowedVideoTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedVideoTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only video files are allowed (mp4, avi, mov, wmv, flv, mkv, webm)'));
    }
};

// File filter for images
const imageFilter = (req, file, cb) => {
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedImageTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
};

// Video upload middleware
export const uploadVideo = multer({
    storage: storage,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB max for videos
    },
    fileFilter: videoFilter
}).single('video');

// Thumbnail upload middleware
export const uploadThumbnail = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max for images
    },
    fileFilter: imageFilter
}).single('thumbnail');

// Multiple file upload (video + thumbnail)
export const uploadVideoWithThumbnail = multer({
    storage: storage,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB max
    }
}).fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]);

// Image upload for channel banner/avatar
export const uploadImage = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    },
    fileFilter: imageFilter
}).single('image');

// Banner upload specifically for channel banners
export const uploadBanner = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    },
    fileFilter: imageFilter
}).single('banner');

// Cleanup uploaded file
export const cleanupFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error('File cleanup error:', error);
    }
};
