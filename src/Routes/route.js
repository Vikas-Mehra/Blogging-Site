const express = require("express");
const router = express.Router();

const midWare = require("../Middleware/auth");
const authorController = require("../Controllers/authorController");
const blogController = require("../Controllers/blogController");

router.get("/getAuthors", authorController.getAuthors); //Get All Authors.

router.post("/authors", authorController.authors); //Create Author.

router.post("/login", authorController.loginAuthor); //Login as Author.

router.post("/blogs", midWare.authentication, blogController.createBlog); //Create Blog.

//Get All Blogs(Authentication(Log-in Token) Required).
router.get("/blogs", midWare.authentication, blogController.getBlogs);

//Update One Blog using BlogID(Authorisation also Required).
router.put(
  "/blogs/:blogId",
  midWare.authentication,
  midWare.ownerAuthorization,
  blogController.updateBlog
);

//Delete One Blog using BlogID(Authorisation also Required).
router.delete(
  "/blogs/:blogId",
  midWare.authentication,
  midWare.ownerAuthorization,
  blogController.deleteBlogById
);

//Delete Blogs using Queries(Query-Authorisation Middleware used).
router.delete(
  "/blogs",
  midWare.authentication,
  midWare.queryAuthorization,
  blogController.deleteBlogByQuery
);

module.exports = router;
