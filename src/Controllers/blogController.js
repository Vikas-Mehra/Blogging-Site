const blogModel = require("../Models/blogModel");

const createBlog = async function (req, res) {
  try {
    blogdata = req.body;
    finalData = await blogModel.create(blogdata);
    res.send({ msg: finalData });
  } catch (error) {
    console.log("this is the error ", error.message);
    res.status(500).send({ msg: error.message });
  }
};

const getBlogs = async function (req, res) {
  try {
    //   blogdata = req.body;
    finalData = await blogModel.find();
    res.send({ msg: finalData });
  } catch (error) {
    console.log("this is the error ", error.message);
    res.status(500).send({ msg: error.message });
  }
};

const updateBlog = async function (req, res) {
  try {
    console.log("UPDATE");
    let blogdata = req.body;
    const updateBlog = await blogModel.findOneAndUpdate(
      {},
      { $set: blogdata },
      { new: true }
    );
    res.send({ msg: updateBlog });
  } catch (error) {
    console.log("this is an error", error.message);
    res.status(500).send({ msg: error.message });
  }
};

const deleteBlogByPath = async function (req, res) {
  try {
    console.log("DELETE BY PATH Params");
    const idbyPathParam = req.param;
    const deletedblog = await blogModel.findOneAndUpdate(
      { _id: req.param.id },
      { $set: { isDeleted: true } },
      { new: true }
    )
    res.status(200).send({ msg: "Done: this blog is deleted" });
  } catch (error) {
    res.status(500).send({ msg: error.message });
  }
};

const deleteBlogByQuery = async function (req, res) {
  try {
    console.log("DELETE BY Query Params");
    let data = req.query;
    const deleteByQuery = await blogModel.updateMany(
      { $and: [data, { isDeleted: false }] },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );
    if (deleteByQuery.matchedCount == 0)
      return res
        .status(400)
        .send({ status: false, msg: "The Blog is already Deleted" });
  } catch (error) {
    res.status(500).send({ msg: error.message });
  }
};

module.exports.createBlog = createBlog;
module.exports.getBlogs = getBlogs;
module.exports.updateBlog = updateBlog;
module.exports.deleteBlogByPath = deleteBlogByPath;
module.exports.deleteBlogByQuery = deleteBlogByQuery;
