require("dotenv").config();
const { decode } = require("jsonwebtoken");

const verifyOwner = (req, res, next) => {
  // intercept token from request
  const token = req.headers.cookie.substring(4);

  const { isOwner } = decode(token);
  if (isOwner) {
    next();
  } else {
    res.json({ no_admin_error: "you don't have access to owner resources" });
  }
};

module.exports = {
  verifyOwner,
};
