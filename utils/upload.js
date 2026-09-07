const multer = require("multer");
const ExpressError = require("./ExpressError.js");

const fileFilter = (req, file, callback) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedMimeTypes.includes(file.mimetype)) {
        return callback(null, true);
    }
    callback(new ExpressError(400, "Only JPEG, PNG, WEBP, and GIF images are allowed."));
};

module.exports = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});
