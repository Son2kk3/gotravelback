const { BlogPost } = require('../models');

exports.findAll = async (req, res) => {
    try {
      const blogs = await BlogPost.find().sort({ createdAt: -1 });
      return res.status(200).json(blogs);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  };


exports.getPostBySlug = async (req, res) => {
    try {
        const post = await BlogPost.findOne({ slug: req.params.slug });
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        return res.status(200).json(post);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
};