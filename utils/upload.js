const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create subdirectories
const subdirs = ['pitch-decks', 'certificates', 'profiles', 'documents'];
subdirs.forEach(dir => {
    const dirPath = path.join(uploadsDir, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
});

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = uploadsDir;

        // Determine subdirectory based on file type or request
        if (req.body.uploadType === 'pitch-deck' || file.fieldname === 'pitchDeck') {
            uploadPath = path.join(uploadsDir, 'pitch-decks');
        } else if (req.body.uploadType === 'certificate' || file.fieldname === 'certificate') {
            uploadPath = path.join(uploadsDir, 'certificates');
        } else if (req.body.uploadType === 'profile' || file.fieldname === 'profile') {
            uploadPath = path.join(uploadsDir, 'profiles');
        } else {
            uploadPath = path.join(uploadsDir, 'documents');
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext);
        cb(null, basename + '-' + uniqueSuffix + ext);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = {
        'pitch-deck': ['.pdf', '.ppt', '.pptx', '.doc', '.docx'],
        'certificate': ['.pdf', '.jpg', '.jpeg', '.png'],
        'profile': ['.jpg', '.jpeg', '.png'],
        'document': ['.pdf', '.doc', '.docx', '.txt']
    };

    const uploadType = req.body.uploadType || 'document';
    const ext = path.extname(file.originalname).toLowerCase();

    const allowed = allowedTypes[uploadType] || allowedTypes.document;

    if (allowed.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Allowed types for ${uploadType}: ${allowed.join(', ')}`), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
    }
});

// Middleware for single file upload
const uploadSingle = (fieldName) => {
    return (req, res, next) => {
        upload.single(fieldName)(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                logger.error(`Multer error: ${err.message}`);
                return res.status(400).json({ error: `Upload error: ${err.message}` });
            } else if (err) {
                logger.error(`Upload error: ${err.message}`);
                return res.status(400).json({ error: err.message });
            }
            next();
        });
    };
};

// Middleware for multiple files upload
const uploadMultiple = (fieldName, maxCount = 5) => {
    return (req, res, next) => {
        upload.array(fieldName, maxCount)(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                logger.error(`Multer error: ${err.message}`);
                return res.status(400).json({ error: `Upload error: ${err.message}` });
            } else if (err) {
                logger.error(`Upload error: ${err.message}`);
                return res.status(400).json({ error: err.message });
            }
            next();
        });
    };
};

// Delete file helper
const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            logger.info(`File deleted: ${filePath}`);
            return true;
        }
        return false;
    } catch (error) {
        logger.error(`File deletion error: ${error.message}`);
        return false;
    }
};

module.exports = {
    upload,
    uploadSingle,
    uploadMultiple,
    deleteFile
};
