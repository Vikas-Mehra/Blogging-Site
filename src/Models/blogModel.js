const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "TITLE can't be Empty."],
      trim: true,
      match: [/^[A-Za-z ]*$/, "TITLE takes Alphabets ONLY."], //Validation(Only Alphabets + whiteSpace).
    },

    body: {
      type: String,
      required: [true, "BODY can't be Empty."],
      trim: true,
    },

    tags: {
      type: [String],
      required: true,
      trim: true,
    },

    category: {
      type: String,
      trim: true,
      required: [true, "CATEGORY can't be Empty."],
      match: [/^[A-Za-z ]*$/, "CATEGORY takes Alphabets ONLY."], //Validation(Only Alphabets + whiteSpace).
    },

    subcategory: { type: [String], trim: true, required: true },

    authorId: {
      type: ObjectId, //Type: Mongoose ObjectID.
      required: [true, "Author ID can't be Empty."],
      ref: "Author", //Reference: "authors" - Collection.
      trim: true,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    publishedAt: {
      type: String,
      default: "",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

//Created Databse named "blogs" and exported.
module.exports = mongoose.model("Blog", blogSchema);
