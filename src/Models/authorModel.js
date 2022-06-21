const mongoose = require("mongoose");

const AuthorSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    lname: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    title: {
      type: String,
      enum: ["Mr", "Mrs", "Miss"],
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      trim: true,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Author", AuthorSchema);
