import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10);

const cloudConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (cloudConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_MIMES.includes(file.mimetype) || !ALLOWED_EXTS.includes(ext)) {
    return cb(new Error('Chỉ chấp nhận file ảnh JPG, PNG, WEBP'), false);
  }
  cb(null, true);
}

// Memory: file stays in RAM then we push to Cloudinary (no Render disk)
export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});

export function handleUploadError(err, _req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File quá lớn (tối đa 5MB)' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
}

/** Upload buffer to Cloudinary, return secure_url or null */
export async function uploadToCloudinary(file, folder = 'baohiemscam') {
  if (!file) return null;
  if (!cloudConfigured) {
    throw new Error('Chưa cấu hình Cloudinary (CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET)');
  }
  const b64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  const result = await cloudinary.uploader.upload(b64, {
    folder,
    resource_type: 'image',
  });
  return result.secure_url;
}
