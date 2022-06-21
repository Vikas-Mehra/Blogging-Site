const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    body: {
      type: String,
      required: true,
      trim: true,
    },

    authorId: {
      type: ObjectId,
      required: true,
      ref: "Author",
    },

    tags: { type: [String], required: true },

    category: {
      type: String,
      trim: true,
      required: true,
    },

    subcategory: { type: [String], trim: true },

    isPublished: {
      type: Boolean,
      default: false,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamp: true }
);

module.exports = mongoose.model("Blog", blogSchema);
