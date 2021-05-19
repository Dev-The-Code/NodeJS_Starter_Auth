const UserModel = require("../Models/UserModel");
const jwt = require("jsonwebtoken");

exports.Protected = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      const decode = jwt.verify(token, process.env.SECRET_KEY, { ignoreExpiration: true });
      // jwt.decode(token);
      if (!decode) {
        return next({
          error: "You Are Not Authnticated.Please Login First",
          statusCode: 401
        });
      }
      const user = await UserModel.findById(decode.id);
      if (!user) {
        return next({ error: "You Are Not Authnticated.Please Login First", statusCode: 401 });
      }
      req.user = user;
      next();
    } else {
      return next({
        error: "You Are Not Authnticated.Please Login First",
        statusCode: 401
      });
    }
  } catch (error) {
    next({
      error: error.message,
      statusCode: 400
    })
  }
};