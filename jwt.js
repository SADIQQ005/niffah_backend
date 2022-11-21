const jwt = require("jsonwebtoken");
const User = require("./models/user");
const Manager = require("./models/manager");

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: maxAge });
  return token;
};

const authUser = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token)
    return res
      .status(401)
      .json({ status: "FAILED", message: "Token is required" });

  try {
    const verified = await jwt.verify(token, process.env.JWT_SECRET);
    if (verified) {
      req.user = await User.findById(verified.id).select("-password");

      return next();
    }
  } catch (error) {
    return res.status(401).json({ errors: error });
  }
};

const managerAuth = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token)
    return res
      .status(401)
      .json({ status: "FAILED", message: "Token is required" });

  try {
    const verified = await jwt.verify(token, process.env.JWT_SECRET);
    if (verified) {
      req.user = await Manager.findById(verified.id).select("-password");

      return next();
    }
  } catch (error) {
    return res.status(401).json({ errors: error });
  }
};

module.exports = { createToken, maxAge, authUser, managerAuth };
