// @Route http://localhost:4000/api/upload/
// @Method POST
// @Desc Upload File
exports.uploadFiles = async (req, res, next) => {
  try {
    console.log(req.file);
    res.status(201).json(req.file);
  } catch (error) {
    console.log(error);
    next({
      error,
      statusCode: 500,
    });
  }
};