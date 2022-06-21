const express = require("express");
const router = express.Router();
const midWare = require("../Middleware/auth");

const authorController = require("../Controllers/authorController");
const blogController = require("../Controllers/blogController");

router.get("/getAuthors", authorController.getAuthors);
router.post("/createAuthor", authorController.createAuthor);
router.post("/loginAuthor", authorController.loginAuthor);

router.get("/getBlogs",  blogController.getBlogs);

router.post("/createBlog",  blogController.createBlog);

router.put("/blogs/:blogId", midWare.authentication, midWare.ownerAuthorization,   blogController.updateBlog);

// router.delete("/blogs/:blogId", midWare.authentication, midWare.ownerAuthorization,   blogController.deleteBlogByPath);

router.delete("/blogs", midWare.authentication, midWare.ownerAuthorization,   blogController.deleteBlogByQuery);


module.exports = router;
