const jwt = require("jsonwebtoken");
const blogModel = require("../Models/blogModel");

////  Authenication_Part  ////
const authentication = (req, res, next) => {
  try {
    let token = req.headers["x-api-key"];
    if (!token) {
      return res.status(400).send({
        status: false,
        msg: "TOKEN Absent.",
      });
    }
    let decodedToken = jwt.verify(token, "this-is-aSecretTokenForLogin");
    if (!decodedToken) {
      return res.status(401).send({
        status: false,
        msg: "Invalid Token. You are NOT Authenticated.",
      });
    }
    req.headers["x-api-key"] = decodedToken;
    next();
  } catch (error) {
    return res.status(500).send({ status: false, Error: error.message });
  }
};

////  Authorisation_Part  ////
const ownerAuthorization = async (req, res, next) => {
  try {
    console.log("Delete");

    const author_Id = req.headers["x-api-key"].authorId;
    console.log("Delet2");

    const blog_Id = ( req.params.blogId || req.query.blogId );
    console.log("Dele3");
    const blog = await blogModel.findById(blog_Id);
    if (blog.authorId.toString() !== author_Id)
      return res.status(403).send({
        status: false,
        msg: "Unauthorized Author.",
      });
    next();
  } catch (error) {
    console.log("Del4");

    res.status(500).send({
      status: false,
      msg: error.message,
    });
  }
};

module.exports.authentication = authentication;
module.exports.ownerAuthorization = ownerAuthorization;
