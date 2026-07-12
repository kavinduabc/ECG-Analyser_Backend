const multer = require("multer");
const path = require("path");
const fs = require("fs");

/*
|--------------------------------------------------------------------------
| ECG Upload Directory
|--------------------------------------------------------------------------
*/

const ecgUploadDir = path.join(__dirname, "..", "uploads", "ecg");

if (!fs.existsSync(ecgUploadDir)) {
    fs.mkdirSync(ecgUploadDir, { recursive: true });
}

/*
|--------------------------------------------------------------------------
| Multer Storage — Preserve original filename, separate by record name
|--------------------------------------------------------------------------
*/

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, ecgUploadDir);
    },
    filename(req, file, cb) {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `ecg-${uniqueSuffix}${ext}`);
    },
});

/*
|--------------------------------------------------------------------------
| File Filter — Only allow .hea and .dat files
|--------------------------------------------------------------------------
*/

function fileFilter(req, file, cb) {
    const allowedExtensions = [".hea", ".dat"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type: ${ext}. Only .hea and .dat files are allowed.`), false);
    }
}

/*
|--------------------------------------------------------------------------
| Upload Middleware — Accepts both hea and dat fields
|--------------------------------------------------------------------------
*/

const uploadECGFiles = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB per file
}).fields([
    { name: "heaFile", maxCount: 1 },
    { name: "datFile", maxCount: 1 },
]);

/*
|--------------------------------------------------------------------------
| Helper — Build relative file path for DB storage
|--------------------------------------------------------------------------
*/

function buildECGFilePath(filename) {
    return path.join("uploads", "ecg", filename).replace(/\\/g, "/");
}

/*
|--------------------------------------------------------------------------
| Helper — Delete uploaded ECG files from disk
|--------------------------------------------------------------------------
*/

function deleteECGFiles(heaFilePath, datFilePath) {
    const heaAbs = path.join(__dirname, "..", heaFilePath);
    const datAbs = path.join(__dirname, "..", datFilePath);

    [heaAbs, datAbs].forEach((filePath) => {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    });
}

module.exports = { uploadECGFiles, buildECGFilePath, deleteECGFiles };
