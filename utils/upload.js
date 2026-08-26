const multer = require("multer");
const ExpressError = require("./ExpressError.js");

const fileFilter = (req, file, callback) => {
    if (file.mimetype.startsWith("image/")) {
        return callback(null, true);
    }
    callback(new ExpressError(400, "Only image files are allowed."));
};

module.exports = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});
