const mongoose = require("mongoose");
const validator = require("validator"); //Imported 'Validator' for validating Email.

const AuthorSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      required: true,
      trim: true,
      match: [/^[A-Za-z]+$/, "Name takes Alphabets ONLY."], //Validation(Only Alphabets).
    },

    lname: {
      type: String,
      required: true,
      trim: true,
      match: [/^[A-Za-z]+$/, "Name takes Alphabets ONLY."], //Validation(Only Alphabets).
    },

    title: {
      type: String,
      enum: {
        values: ["Mr", "Mrs", "Miss"],
        message: 'TITLE can ONLY be: ["Mr", "Mrs", "Miss"].', //ERROR Message.
      },
      required: [true, "TITLE Mandatory."],
      trim: true,
    },

    email: {
      unique: true,
      type: String,
      required: true,
      trim: true,
      validate(value) {
        //Validating Email.
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email Format !!");
        }
      },
    },

    password: {
      type: String,
      trim: true,
      required: true,
      minlength: [6, "Minimum length is 6 characters."], //Minimum length of Password.
      maxlength: [15, "Maximum length is 15 characters."], //Maximum length of Password.
    },
  },
  { timestamps: true }
);

//Created Databse named "authors" and exported.
module.exports = mongoose.model("Author", AuthorSchema);

//POSTMAN:
// {
//   "fname": "Vikas",
//   "lname": "Mehra",
//   "title": "Mr",
//   "email": "vikas@gmail.com",
//   "password": "asd123"
// }
