const { validationResult } = require("express-validator");
const fs = require("fs");

exports.checkValidation = (req) => {
    let errObj = {};
    const isError = validationResult(req);
    if (isError.errors.length > 0) {
        isError.errors.map((err) => {
            errObj[err.param] = err.msg
        })
        return {
            statusCode: 400,
            error: errObj
        }
    } else return null;
}

exports.deleteImage = (req, path) => {
    if (req && req.file) {
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path, (err) => { console.log(err) });
        }
    }
    else if (path) {
        if (fs.existsSync(path)) {
            fs.unlinkSync(path, (err) => { console.log(err) });
        }
    }
}

exports.returnImageArr = (req) => (req.files.map((imageFile => ({
    mimietype: imageFile.mimietype,
    filename: imageFile.filename,
    path: imageFile.path
}))))

exports.generateUniqueId = (lastGeneratedId) => {
    let newGeneratedId;
    if (!lastGeneratedId) {
      newGeneratedId = "0000";
    } else {
      let newId = lastGeneratedId * 1 + 1;
      let slicedId = "0000".slice(newId.toString().length, 4);
      newGeneratedId = slicedId.concat(newId);
    }
    return newGeneratedId;
  };
  