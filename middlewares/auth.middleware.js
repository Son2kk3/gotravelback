const { User, Blacklist } = require("../models/index");
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = async (req, res, next) => {
  const response = {};  
  const token = req.get("Authorization")?.split(" ")[1];  
  if (!token) {   
    Object.assign(response, {
      status: 401,
      message: "Unauthorize",
    });
  } else {
    try {
      const existToken = await Blacklist.findOne({ token: token });
      if (existToken) {
        throw new Error("Token in blacklist");
      }
      const { JWT_SECRET } = process.env;
      const { userId, exp } = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error("User not exist");
      }
      req.user = { ...user, accessToken: token, expired: new Date(exp * 1000) };
      return next();
    } catch {      
      Object.assign(response, {
        status: 401,
        message: "Unauthorize",
      });
    }
  }
  res.status(response.status).json(response);
};
