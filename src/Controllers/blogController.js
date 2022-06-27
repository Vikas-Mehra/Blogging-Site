const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const authorModel = require("../Models/authorModel");
const blogModel = require("../Models/blogModel");

/*---------------------------------------------------------------------------------------------------------------------------- 1. API - Create Blog --------------------------------- -----------------------------------------------------------------------------------------*/
const createBlog = async function (req, res) {
  try {
    const regex = /^[a-zA-Z ]*$/; //Regex Validation (Only Alphabets followed by whiteSpaces).

    const blogdata = req.body;
    const author_Id = req.body.authorId;

    ////~~~~~~~EMPTY BODY Validation:
    if (!Object.keys(req.body).length) {
      return res.status(400).send({ status: false, msg: "NO Data in BODY." });
    }

    ///Validate isPublished NOT Empty String.
    try {
      if (req.body.hasOwnProperty("isPublished")) {
        if (req.body.isPublished.trim().length === 0) {
          return res
            .status(400)
            .send({ status: false, msg: "'isPublished' can't be Empty." });
        }
      }
    } catch (error) {
      return res.status(400).send({
        status: false,
        msg: `"isPublished" can ONLY be String("true" or "false").`,
      });
    }

    //Subcategory(as STRING) Validations.
    if (req.body.subcategory) {
      if (typeof req.body.subcategory === "string") {
        if (!req.body.subcategory.trim().length) {
          return res
            .status(400)
            .send({ status: false, msg: "SUBCATEGORY can't be Empty." });
        }
        if (!regex.test(req.body.subcategory)) {
          return res
            .status(400)
            .send({ status: false, msg: "SUBCATEGORY can be Alphabets ONLY." });
        }
      } //Subcategory(as ARRAY) Validation.
      if (typeof req.body.subcategory === "object") {
        const x = req.body.subcategory.filter((x) => x.trim().length === 0);
        if (x.length) {
          return res
            .status(400)
            .send({ status: false, msg: "SUBCATEGORY can't be Empty." });
        }
        const y = req.body.subcategory.filter((x) => !regex.test(x));
        if (y.length) {
          return res
            .status(400)
            .send({ status: false, msg: "SUBCATEGORY can be Alphabets ONLY." });
        } else {
          let flag = 0;
          const subcat = req.body.subcategory;
          for (let i = 0; i < subcat.length - 1; i++) {
            for (let j = i + 1; j < subcat.length; j++) {
              if (subcat[i].toLowerCase() === subcat[j].toLowerCase()) {
                flag++;
              }
            }
          }
          if (flag) {
            return res.status(400).send({
              status: false,
              msg: "SUBCATEGORY can ONLY have UNIQUE values.",
            });
          }
        }
      }
    } else {
      return res
        .status(400)
        .send({ status: false, msg: "SUBCATEGORY Missing in Body." });
    }
    //...........

    //TAGS(as STRING) Validation.
    if (req.body.tags) {
      if (typeof req.body.tags === "string") {
        if (!req.body.tags.trim().length) {
          return res
            .status(400)
            .send({ status: false, msg: "TAGS can't be Empty." });
        }
        if (!regex.test(req.body.tags)) {
          return res
            .status(400)
            .send({ status: false, msg: "TAGS can be Alphabets ONLY." });
        }
      } //TAGS(as ARRAY) Validation.
      if (typeof req.body.tags === "object") {
        const x = req.body.tags.filter((x) => x.trim().length === 0);
        if (x.length) {
          return res
            .status(400)
            .send({ status: false, msg: "TAGS can't be Empty." });
        }
        const y = req.body.tags.filter((x) => !regex.test(x));
        if (y.length) {
          return res
            .status(400)
            .send({ status: false, msg: "TAGS can be Alphabets ONLY." });
        } else {
          let flag = 0;
          const tag = req.body.tags;
          for (let i = 0; i < tag.length - 1; i++) {
            for (let j = i + 1; j < tag.length; j++) {
              if (tag[i].toLowerCase() === tag[j].toLowerCase()) {
                flag++;
              }
            }
          }
          if (flag) {
            return res.status(400).send({
              status: false,
              msg: "TAGS can ONLY have UNIQUE values.",
            });
          }
        }
      }
    } else {
      return res
        .status(400)
        .send({ status: false, msg: "TAGS Missing in Body." });
    }

    //AuthorID Validation.
    if (!author_Id) {
      return res.status(400).send({ status: false, msg: "Author ID Missing." });
    }

    if (!mongoose.Types.ObjectId.isValid(author_Id)) {
      return res.status(400).send({
        status: false,
        msg: "AuthorID NOT a Valid Mongoose-ObjectID.",
      });
    }

    //Find Document by AuthorID.
    const author = await authorModel.findById(author_Id);
    if (!author) {
      return res.status(400).send({ status: false, msg: "Author NOT Found." });
    } else if (author_Id !== author._id.toString()) {
      return res
        .status(400)
        .send({ status: false, msg: "Author ID NOT Correct." });
    }

    //Create Document from- req.body
    let finalData = await blogModel.create(blogdata);

    //'isPublished' Validation(Present in body or NOT).
    try {
      if (req.body.hasOwnProperty("isPublished")) {
        if (req.body.isPublished === "true") {
          //isPublished:"true"
          finalData = await blogModel.findOneAndUpdate(
            { _id: finalData._id.toString() },
            {
              $set: {
                isPublished: true,
                publishedAt: new Date().toISOString(),
              },
            },
            { new: true }
          ); //new Date().toUTCString() - /GMT/$
        } else if (req.body.isPublished === "false") {
          //isPublished:"false"
          finalData = await blogModel.findOneAndUpdate(
            { _id: finalData._id.toString() },
            { $set: { isPublished: false, publishedAt: "" } },
            { new: true }
          );
        } else {
          return res.status(400).send({
            status: false,
            msg: "isPublished Can ONLY be: 'true' or 'false'.",
          });
        }
      }
    } catch (error) {
      return res.status(400).send({ status: false, msg: error.message });
    }

    return res.status(201).send({ status: true, data: finalData });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};

/*-----------------------------------------------------------------------------------------
---------------------------- 2. API - GET Blogs -------------------------------------- -----------------------------------------------------------------------------------------*/
const getBlogs = async function (req, res) {
  const authorId = req.query.authorId;
  const category = req.query.category;
  const tags = req.query.tags;
  const subcategory = req.query.subcategory;

  ////~~~~~~Validate AuthorID
  if (authorId) {
    if (!mongoose.Types.ObjectId.isValid(authorId)) {
      return res.status(400).send({
        status: false,
        msg: "AuthorID NOT a Valid Mongoose-ObjectID.",
      });
    }
  }
  try {
    //~~~~~~~~~find all Published & Not-Deleted Blogs.
    let body = await blogModel.find({ isDeleted: false, isPublished: true });
    //~~~~~~~~~Find all blogs with all 4 Queries Present at once.
    if (category && authorId && subcategory && tags) {
      body = await blogModel.find({
        isDeleted: false,
        isPublished: true,
        category,
        authorId,
        subcategory,
        tags,
      });
    }
    //~~~~~~~Find all blogs with  3 Queries Present at a time.
    else if (category && authorId && subcategory) {
      body = await blogModel.find({
        isDeleted: false,
        isPublished: true,
        category,
        authorId,
        subcategory,
      });
    } else if (category && authorId && tags) {
      body = await blogModel.find({
        isDeleted: false,
        isPublished: true,
        category,
        authorId,
        tags,
      });
    } else if (category && subcategory && tags) {
      body = await blogModel.find({
        isDeleted: false,
        isPublished: true,
        category,
        subcategory,
        tags,
      });
    } else if (authorId && subcategory && tags) {
      body = await blogModel.find({
        isDeleted: false,
        isPublished: true,
        authorId,
        subcategory,
        tags,
      });
    }
    //~~~~~~~Find all blogs with 2 Queries Present at a time.
    else if (subcategory && tags) {
      body = await blogModel.find({
        isDeleted: false,
        isPublished: true,
        subcategory,
        tags,
      });
    } else if (category && tags) {
      body = await blogModel.find({
        isDeleted: false,
        isPublished: true,
        category,
        tags,
      });
    } else if (category && authorId) {
      body = await blogModel.find({
        isDeleted: false,
        isPublished: true,
        category,
        authorId,
      });
    } else if (authorId && subcategory) {
      body = await blogModel.find({
        isDeleted: false,
        isPublished: true,
        authorId,
        subcategory,
      });
    }
    //~~~~~~~Find all blogs with ONLY 1 Query Present.
    else if (authorId) {
      body = await blogModel.find({
        isDeleted: false,
        isPublished: true,
        authorId,
      });
    } else if (category) {
      body = await blogModel.find({
        isDeleted: false,
        isPublished: true,
        category,
      });
    } else if (tags) {
      body = await blogModel.find({
        isDeleted: false,
        isPublished: true,
        tags,
      });
    } else if (subcategory) {
      body = await blogModel.find({
        isDeleted: false,
        isPublished: true,
        subcategory,
      });
    }
    //~~~~~Validate if Blogs-FOUND NOT empty.
    if (!body.length) {
      return res.status(404).send({ status: false, msg: "No Blogs Found." });
    }
    //~~~~~~Send all Requested Blogs as Response.
    else {
      return res.status(200).send({ status: true, data: body });
    }
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.tags });
  }
};

/*-----------------------------------------------------------------------------------------
---------------------------- 3. API - Update Blogs -------------------------------------- -----------------------------------------------------------------------------------------*/
const updateBlog = async function (req, res) {
  try {
    let blogId = req.params.blogId;
    let blog = await blogModel.findById(blogId);

    ////~~~~~~~EMPTY BODY Validation:
    if (!Object.keys(req.body).length) {
      return res
        .status(400)
        .send({ status: false, msg: "NO Data in BODY for Updation." });
    }
    //Validate Blog exists or Not.
    if (!blog) {
      return res.status(404).send({
        status: false,
        msg: "Blog Not Found(BlogId doesn't exist).",
      });
    }
    //(a). IF Blog-found is NOT Deleted:
    if (!blog.isDeleted) {
      const regex = /^[a-zA-Z ]*$/; //Regex Validation (Only Alphabets followed by whiteSpaces).

      let tags = req.body.tags;
      let subcategory = req.body.subcategory;
      let title = req.body.title;
      let body = req.body.body;
      let isPublished = req.body.isPublished;

      let updatedTags = blog.tags;
      let updatedSubcategory = blog.subcategory;

      ////req.body Non-Empty Validation.
      if (!(title || body || subcategory || tags || isPublished)) {
        return res.status(400).send({
          status: false,
          msg: "REQUEST-BODY should have atleast ONE of these fields NON-EMPTY for updation:  'title' , 'body', 'subcategory', 'tags' OR 'isPublished'.",
        });
      }

      ////~~~~~~~~Validate 'body' field.
      if (body === "") {
        return res
          .status(400)
          .send({ status: false, msg: "BODY-Field can NOT be Empty." });
      }
      if (body) {
        if (!body.trim().length) {
          return res
            .status(400)
            .send({ status: false, msg: "BODY-Field can NOT be Empty." });
        }
      }

      ////~~~~~~~~Validate 'title' field.
      if (title === "") {
        return res
          .status(400)
          .send({ status: false, msg: "TITLE can NOT be Empty." });
      }
      if (title) {
        if (!title.trim().length) {
          return res
            .status(400)
            .send({ status: false, msg: "TITLE can NOT be Empty." });
        }
        if (!regex.test(title)) {
          return res
            .status(400)
            .send({ status: false, msg: "TITLE can be Alphabets ONLY." });
        }
      }

      //~~~~~~~~Validate 'tags' field(STRING).
      if (tags) {
        if (typeof tags === "string") {
          //Check If Tags NOT Empty.
          if (!tags.trim().length) {
            return res
              .status(400)
              .send({ status: false, msg: "TAGS can't be Empty." });
          }
          //Check If Tags are Alphabets(followed by WhiteSpace) ONLY.
          else if (!regex.test(tags)) {
            return res
              .status(400)
              .send({ status: false, msg: "TAGS can be Alphabets ONLY." });
          }
          //Check For Duplicate-Tags in Blog.
          const duplicate = blog.tags.filter(
            (x) => x.toLowerCase().trim() === req.body.tags.toLowerCase().trim()
          );
          //If Duplicate already exists:
          if (duplicate.length) {
            return res.status(400).send({
              status: false,
              msg: `TAGS: "${req.body.tags}" already exists in Blog's Document(Duplicates NOT allowed).`,
            });
          }
          //If Tag - Valid Then Push It.
          else {
            updatedTags.push(tags.trim());
          }
        }

        //~~~~~~~~Validate 'TAGS' (ARRAY).
        if (typeof tags === "object") {
          //Check If any of req.body.tags are Empty.
          const empty = tags.filter((a) => a.trim().length === 0);
          //Check for Duplicate tags in Blog & Push Duplicates' in "duplicate[] Array".
          let duplicate = [];
          blog.tags.forEach((x) => {
            req.body.tags.forEach((y) => {
              if (x.toLowerCase().trim() === y.toLowerCase().trim()) {
                duplicate.push(y);
              }
            });
          });
          //If any Tags in "req.body.tags" EMPTY.
          if (empty.length) {
            return res
              .status(400)
              .send({ status: false, msg: "TAGS can't be Empty." });
          }
          //If any Tags in "req.body.tags" are non-Alphabets(+whiteSpace).
          const y = tags.filter((x) => !regex.test(x));
          if (y.length) {
            return res
              .status(400)
              .send({ status: false, msg: "TAGS can be Alphabets ONLY." });
          }
          //If (Duplicate) elements in duplicate[].
          if (duplicate.length) {
            return res.status(400).send({
              status: false,
              msg: `TAGS: "${duplicate}" already exists in Blog's Document(Duplicates NOT allowed).`,
            });
          }
          //Check If Tags in "req.body.tags" are Unique 'themselves'.
          else {
            let flag = 0;
            const tag = tags;
            for (let i = 0; i < tag.length - 1; i++) {
              for (let j = i + 1; j < tag.length; j++) {
                if (
                  tag[i].toLowerCase().trim() === tag[j].toLowerCase().trim()
                ) {
                  flag++;
                }
              }
            }
            // Unique TAGS ONLY.
            if (flag) {
              return res.status(400).send({
                status: false,
                msg: "TAGS can ONLY have UNIQUE values.",
              });
            }
          }
          if (true) {
            //"(true)" => 'ALL' Above validations alredy checked/done.
            //If TAGS validated then PUSH them into 'updatedTags' for Updation.
            tags.map((x) => updatedTags.push(x.trim()));
          }
        }
      }

      //Validate Subcategory(String).
      if (subcategory) {
        if (typeof subcategory === "string") {
          //Check If Subcategory NOT Empty.
          if (!subcategory.trim().length) {
            return res
              .status(400)
              .send({ status: false, msg: "SUBCATEGORY can't be Empty." });
          }
          //Check If Subcategory are Alphabets(followed by WhiteSpace) ONLY.
          else if (!regex.test(subcategory)) {
            return res.status(400).send({
              status: false,
              msg: "SUBCATEGORY can be Alphabets ONLY.",
            });
          }
          //Check For Duplicate-Subcategory in Blog.
          const duplicate = blog.subcategory.filter(
            (x) =>
              x.toLowerCase().trim() ===
              req.body.subcategory.toLowerCase().trim()
          );
          //If Duplicate already exists:
          if (duplicate.length) {
            return res.status(400).send({
              status: false,
              msg: `SUBCATEGORY: "${req.body.subcategory}" already exists in Blog's Document(Duplicates NOT allowed).`,
            });
          }
          //If Tag - Valid Then Push It.
          else {
            updatedSubcategory.push(subcategory.trim());
          }
        }

        //Validate "Subcategory"(ARRAY).
        if (typeof subcategory === "object") {
          //Check If any of req.body.subcategory are Empty.
          const empty = subcategory.filter((x) => x.trim().length === 0);
          //Check for Duplicate subcategory in Blog & Push Duplicates' in "duplicate[] Array".
          let duplicate = [];
          blog.subcategory.forEach((x) => {
            req.body.subcategory.forEach((y) => {
              if (x.toLowerCase().trim() === y.toLowerCase().trim()) {
                duplicate.push(y);
              }
            });
          });
          //If any Subcategories in "req.body.subcategory" EMPTY.
          if (empty.length) {
            return res
              .status(400)
              .send({ status: false, msg: "SUBCATEGORY can't be Empty." });
          }
          //If any Subcategories in "req.body.tags" are non-Alphabets(+whiteSpace).
          const y = subcategory.filter((x) => !regex.test(x));
          if (y.length) {
            return res.status(400).send({
              status: false,
              msg: "SUBCATEGORY can be Alphabets ONLY.",
            });
          }
          //If (Duplicate) elements in duplicate[].
          if (duplicate.length) {
            return res.status(400).send({
              status: false,
              msg: `SUBCATEGORY: "${duplicate}" already exists in Blog's Document(Duplicates NOT allowed).`,
            });
          }
          //Check If Subcategory in "req.body.tags" are Unique 'themselves'.
          else {
            let flag = 0;
            const tag = subcategory;
            for (let i = 0; i < tag.length - 1; i++) {
              for (let j = i + 1; j < tag.length; j++) {
                if (
                  tag[i].toLowerCase().trim() === tag[j].toLowerCase().trim()
                ) {
                  flag++;
                }
              }
            }
            // Unique SUBCATEGORIES ONLY.
            if (flag) {
              //Subcategory can have UNIQUE Elements ONLY.
              return res.status(400).send({
                status: false,
                msg: "SUBCATEGORY can ONLY have UNIQUE values.",
              });
            }
          }
          if (true) {
            //"(true)" => 'ALL' Above validations alredy checked/done.
            //If SUBCATEGORY validated then PUSH them into 'updatedSubcategory' for Updation.
            subcategory.map((x) => updatedSubcategory.push(x.trim()));
          }
        }
      }

      //Validate isPublished(Non-Empty)
      if (isPublished === "") {
        return res
          .status(400)
          .send({ status: false, msg: "isPublished-Field can NOT be Empty." });
      }
      if (isPublished) {
        if (!isPublished.trim().length) {
          return res.status(400).send({
            status: false,
            msg: "isPublished-Field can NOT be Empty.",
          });
        }
      }

      //UPDATE(OverWrite)- "body" and "title" Fields.
      let updatedUser = await blogModel.findOneAndUpdate(
        { _id: blog._id },
        { $set: { body: body, title: title } },
        { new: true }
      );

      //UPDATE(PUSH)- "TAGS" Field.
      if (tags) {
        updatedUser = await blogModel.findOneAndUpdate(
          { _id: blog._id },
          { $set: { tags: updatedTags } },
          { new: true }
        );
      }

      //UPDATE(PUSH)- "SUBCATEGORY" Field.
      if (subcategory) {
        updatedUser = await blogModel.findOneAndUpdate(
          { _id: blog._id },
          { $set: { subcategory: updatedSubcategory } },
          { new: true }
        );
      }

      //isPublished-Field can ONLY be 'true' or 'false' Validation.
      if (isPublished) {
        if (isPublished === "true") {
          updatedUser = await blogModel.findOneAndUpdate(
            { _id: blog._id },
            {
              $set: {
                isPublished: true,
                publishedAt: new Date().toISOString(),
              },
            },
            { new: true }
          );
        } else if (isPublished === "false") {
          updatedUser = await blogModel.findOneAndUpdate(
            { _id: blog._id },
            { $set: { isPublished: false, publishedAt: "" } },
            { new: true }
          );
        } else {
          return res.status(400).send({
            status: false,
            msg: "isPublished-Field can ONLY be 'true' or 'false'.",
          });
        }
      }

      //find Updated Blog again to send as Response.
      let updatedBlog = await blogModel.findById(blogId);
      return res.status(200).send({ status: true, data: updatedBlog });
    }

    //(b). IF Blog-found but Deleted.
    else {
      return res
        .status(404)
        .send({ status: false, msg: "Blog NOT Found(Already Deleted)." });
    }
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};

/*-----------------------------------------------------------------------------------------
------------------ 4. API - Delete Blogs By Path-Params AND Blog-ID ---------------------- -----------------------------------------------------------------------------------------*/
const deleteBlogById = async function (req, res) {
  try {
    //get BlogID from Path-params.
    const blogIdPath = req.params.blogId;

    //Find Blog using BlogID.
    const blog = await blogModel.findById({ _id: blogIdPath });

    //IF Blog NOT Found.
    if (!blog) {
      return res
        .status(404)
        .send({ status: false, msg: "Blog ID doesn't exist in Database." });
    }

    //IF Blog Already Deleted.
    if (blog.isDeleted) {
      return res
        .status(404)
        .send({ status: false, msg: "Blog Not Found (ALREADY DELETED)." });
    }

    //Delete Blog.
    const deletedBlog = await blogModel.findOneAndUpdate(
      { _id: blogIdPath },
      { $set: { isDeleted: true, deletedAt: new Date().toISOString() } },
      { new: true }
    );

    //Send Deleted Blog in Response.
    return res.status(200).send({ status: true, data: deletedBlog });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};

/*-----------------------------------------------------------------------------------------
----------------------- 5. API - Delete Blogs By Query-Params---------------------------- -----------------------------------------------------------------------------------------*/
const deleteBlogByQuery = async function (req, res) {
  try {
    // //Find ALL Blogs with COMBINED Queries.
    let blogs = await blogModel.find(req.query);

    //~~~~~~Decode Token to match AuthorID with "blog's-authorId".
    const token = req.headers["x-api-key"];
    const decodedToken = jwt.verify(token, "this-is-aSecretTokenForLogin");

    //~~~~~~Check if Author's Blog Exists.
    const check = blogs.filter(
      (x) => x.authorId.toString() === decodedToken.authorId
    );
    if (check.length) {
      const finalBlogs = check.filter((x) => x.isDeleted == false);

      //If Blogs doesn't exist(already Deleted).
      if (!finalBlogs.length) {
        return res.status(404).send({
          status: false,
          msg: "Blog does NOT Exist (ALREADY DELETED).",
        });
      }

      //If Blogs exist then Delete Blogs.
      else {
        let allDeletedBlogs = [];
        for (let i = 0; i < finalBlogs.length; i++) {
          deletedBlog = await blogModel.findByIdAndUpdate(
            { _id: finalBlogs[i]._id },
            { $set: { isDeleted: true, deletedAt: new Date().toISOString() } },
            { new: true }
          );
          allDeletedBlogs.push(deletedBlog); //Push Deleted Blogs for Response.
        }

        //Send Deleted Blogs as Response.
        return res.status(200).send({ status: true, data: allDeletedBlogs });
      }
    }
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};

//Exported Functions
module.exports.createBlog = createBlog;
module.exports.getBlogs = getBlogs;
module.exports.updateBlog = updateBlog;
module.exports.deleteBlogById = deleteBlogById;
module.exports.deleteBlogByQuery = deleteBlogByQuery;
