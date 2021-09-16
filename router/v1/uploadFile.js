const express = require("express");
const { Protected } = require("../../middleWares/auth");
const uploadController = require("../../controllers/upload-controller");
const { fileUpload } = require("../../middleWares/file-upload");
const Router = express.Router();

// Protected Routes
Router.use(Protected);
Router.route("/upload").post(
  fileUpload.single("file"),
  uploadController.uploadFiles
);

module.exports = Router;
