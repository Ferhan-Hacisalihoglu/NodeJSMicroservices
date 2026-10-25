import multer from 'multer';
import { AppError } from 'shared';



export const uploadImage = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 5 * 1024 * 1024},
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            cb(new AppError("Only image files are allowed", 400));
            return;
        }

        cb(null, true);
    }
}).single('image');
