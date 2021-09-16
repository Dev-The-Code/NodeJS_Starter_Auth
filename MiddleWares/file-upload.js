const multer = require("multer");
const uuid = require("uuid");
const MIME_TYPE = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
  "image/webp": "webp",
  "image/jfif": "jfif"
};
exports.fileUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "Uploads/");
    },
    filename: (req, file, cb) => {
      const extension = MIME_TYPE[file.mimetype];
      cb(null, uuid.v1() + "." + extension);
    },
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE[file.mimetype];
    const error = isValid ? null : new Error("Invalid Image Type");
    cb(error, isValid);
  },
});