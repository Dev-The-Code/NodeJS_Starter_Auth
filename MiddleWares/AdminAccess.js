exports.grantAccess = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next({
        error: `You Are Unauthorized For This Action`,
        statusCode: 403
      });
    }
    next();
  };
};