import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'fms_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
  } as any, // Cast to any because the params type in CloudinaryStorage can be restrictive
});

const upload = multer({ storage: storage });

export { cloudinary, upload };
