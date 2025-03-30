const { User } = require("../models/index");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcrypt");
const saltRounds = 10;
module.exports = {
  getUser: async (req, res) => {
    const response = {};
    try {
      await User.find().select("-password")
        .then((res) => {
          Object.assign(response, {
            status: 200,
            message: "Success",
            data: res,
          });
        })
        .catch((e) => {
          Object.assign(response, {
            status: 404,
            message: "Not Found",
          });
        });
    } catch {
      Object.assign(response, {
        status: 500,
        message: "Server Error",
      });
    }
    return res.status(response.status).json(response);
  },

  getUserById: async (req, res) => {
    const response = {};
    const { id } = req.params;
    try {
      await User.findOne({ _id: id }).select("-password")
        .then((res) => {
          Object.assign(response, {
            status: 200,
            messagge: "Succees",
            data: res,
          });
        })
        .catch((e) => {
          Object.assign(response, {
            status: 404,
            messagge: "Not Found",
          });
        });
    } catch {
      Object.assign(response, {
        status: 500,
        messagge: "Server Error",
      });
    }
    return res.status(response.status).json(response);
  },

  changePassword: async (req, res) => {
    const response = {};
    const { username } = req.params;
    const { password } = req.body;
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "Username not exist!",
      });
    }
    try {
      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(password, salt);
      const user = await User.updateOne(
        { username: username },
        { password: hash },
      );
      Object.assign(response, {
        status: 200,
        message: "Succees",
        data: user,
      });
    } catch {
      Object.assign(response, {
        status: 500,
        message: "Server Error",
      });
    }
    return res.status(response.status).json(response);
  },

  updateUser: async (req, res) => {
    const { id } = req.params;
    const { fullname, phone, address, avatar} = req.body;
    
    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User not found",
        });
      }
  
      user.fullname = fullname || user.fullname;
      user.phone = phone || user.phone;
      user.address = address || user.address;
      user.avatar = avatar || user.avatar;
  
      await user.save();
      return res.status(200).json({
        status: 200,
        message: "User updated successfully",
        data: user.toObject(),
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Server error",
        error: error.message
      });
    }
  },

  followUser : async (req, res) => {
    const { followId } = req.params;
    const currentUserId = req.user && req.user._doc._id;    
    
    try {
      const user = await User.findById(followId);
      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User not found",
        });
      }
  
      let message = "";
      if (user.follow.includes(currentUserId)) {
        user.follow = user.follow.filter((id) => id.toString() !== currentUserId.toString());
        console.log(user.follow);
        message = "Unfollowed successfully";
      } else {
        user.follow.push(currentUserId);
        message = "Followed successfully";
      }
      
      await user.save();
      return res.status(200).json({
        status: 200,
        message,
        data: user.toObject(),
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Server error",
        error: error.message,
      });
    }
  },

};
