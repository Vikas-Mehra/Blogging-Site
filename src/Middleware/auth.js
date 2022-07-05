const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const blogModel = require("../Models/blogModel");
const authorModel = require("../Models/authorModel");

/*--------------------------------------------------------------------------------------
--------------------------------- 1. Authenication Middleware--------------------------- --------------------------------------------------------------------------------------*/
const authentication = async (req, res, next) => {
  try {
    //Check If Token present in Header.
    let token = req.headers["x-api-key"];
    if (!token) {
      return res.status(400).send({
        status: false,
        msg: "TOKEN Absent.",
      });
    }

    //~~~~~~~~Verify Token.
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, "this-is-aSecretTokenForLogin");
    } catch (error) {       //If Signature or Token-format Incorrect or Token-Invalid.
      return res.status(400).send({
        status: false,
        msg: error.message,
      });
    }

    //~~~~~~~~Search Author in Database for Authentication.
    const author_Id = decodedToken.authorId;
    const authorByAuthorId = await authorModel.findById(author_Id);
    if (!authorByAuthorId) {
      return res.status(401).send({
        status: false,
        msg: "NOT Authenticated:Your AuthorID(in TOKEN) Not In Database. Login AGAIN(NEW Token Required).",
      });
    }

    //Author Authenticated, so call "next()".
    next();
  } catch (error) {
    return res.status(500).send({ status: false, Error: error.message });
  }
};

/*----------------------------------------------------------------------------------------------------------------------- 2. Authorisation Middleware -------------------------------- -----------------------------------------------------------------------------------------*/
const ownerAuthorization = async (req, res, next) => {
  try {
    //Get BlogID from Path-params.
    const blog_Id = req.params.blogId;

    //~~~~Check if "blogId" is a Valid Mongoose ObjectID.
    if (!mongoose.Types.ObjectId.isValid(blog_Id)) {
      return res.status(400).send({
        status: false,
        msg: "BlogID in Path-Params NOT a Valid Mongoose-ObjectID.",
      });
    }

    //~~~~~~~~Find Blog by BlogID.
    const blogByBlogId = await blogModel.findById(blog_Id);
    if (!blogByBlogId) {
      return res.status(404).send({
        status: false,
        msg: "Blog Not Found.",
      });
    }

    //~~~~~~Decode Token to match AuthorID with "blog's-authorId".
    let token = req.headers["x-api-key"];
    let decodedToken = jwt.verify(token, "this-is-aSecretTokenForLogin");

    //~~~~~~Check for Unauthorised Author.
    if (blogByBlogId.authorId.toString() !== decodedToken.authorId) {
      return res.status(403).send({
        status: false,
        msg: "Unauthorized Author: You can't Edit/Delete other's Blogs.",
      });
    }

    //Author Authenticated, so call "next()".
    next();
  } catch (error) {
    return res.status(500).send({
      status: false,
      msg: error.message,
    });
  }
};

/*----------------------------------------------------------------------------------------------------------------- 3. Authorisation Middleware for DeleteByQuery ------------------- -----------------------------------------------------------------------------------------*/
const queryAuthorization = async (req, res, next) => {
  try {
    //IF No Queries Provided.
    if (!Object.keys(req.query).length) {
      return res.status(400).send({
        status: false,
        msg: "No Queries Provided.",
      });
    }

    //Find ALL Blogs with COMBINED Queries.
    let blogs = await blogModel.find(req.query);
    if (!blogs.length) {
      return res.status(404).send({
        status: false,
        msg: "NO Blogs Found.",
      });
    }

    //~~~~~~Decode Token to match AuthorID with "blog's-authorId".
    const token = req.headers["x-api-key"];
    const decodedToken = jwt.verify(token, "this-is-aSecretTokenForLogin");

    //~~~~~~Check for Unauthorised Author.
    const check = blogs.filter(
      (x) => x.authorId.toString() === decodedToken.authorId
    );
    //If Author has No own Blogs.
    if (!check.length) {
      return res.status(403).send({
        status: false,
        msg: "Unauthorized Author: You can't Edit or Delete other's Blogs.",
      });
    }

    //Author Authenticated, so call "next()".
    next();
  } catch (error) {
    return res.status(500).send({
      status: false,
      msg: error.message,
    });
  }
};

//Exported Middlewares
module.exports.authentication = authentication;
module.exports.ownerAuthorization = ownerAuthorization;
module.exports.queryAuthorization = queryAuthorization;
