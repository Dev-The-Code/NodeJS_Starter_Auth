const multer = require("multer");
const path = require("path");
const aws = require("aws-sdk");
const multerS3 = require("multer-s3");

const Secret_AccessKey = process.env.Secret_AccessKey;
const AccessKeyId = process.env.AccessKeyId;
const Region = process.env.Region;
const BucketS3 = process.env.Bucket;

aws.config.update({
  secretAccessKey: Secret_AccessKey,
  accessKeyId: AccessKeyId,
  region: Region,
  Bucket: BucketS3,
});

s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== "") {
    cb(null, true);
  } else {
    cb(new Error("File format should unvalid"), false);
  }
};

// console.log(s3, 's3');

exports.fileUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: BucketS3,
    acl: "public-read",
    key: function (req, file, cb) {
      cb(
        null,
        `${file.fieldname}-${Date.now()}-${Math.random() * 1000}${path.extname(
          file.originalname
        )}`
      );
    },
  }),
  limits: {
    fileSize: 20000000,
  },
  fileFilter: fileFilter,
});