const fs = require("fs");
const path = require("path");
const multer = require("multer");
const ExpressError = require("./ExpressError.js");

const uploadDirectory = path.join(__dirname, "..", "public", "uploads");
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
    destination: uploadDirectory,
    filename: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
        callback(null, uniqueName);
    },
});

const fileFilter = (req, file, callback) => {
    if (file.mimetype.startsWith("image/")) {
        return callback(null, true);
    }
    callback(new ExpressError(400, "Only image files are allowed."));
};

module.exports = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});
