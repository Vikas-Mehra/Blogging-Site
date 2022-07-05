const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const authorModel = require("../Models/authorModel");
const { default: isEmail } = require("validator/lib/isemail");

/*-----------------------------------------------------------------------------------------
---------------------------- 1. API - Create Author -------------------------------------- -----------------------------------------------------------------------------------------*/
const authors = async function (req, res) {
  try {
    const regex = /^[a-zA-Z\- ]*$/;
    const authordata = req.body;
    const { fname, lname, title, email, password } = req.body;

    ////~~~~~~~EMPTY BODY Validation:
    if (!Object.keys(req.body).length) {
      return res.status(400).send({ status: false, msg: "NO Data in BODY." });
    }
    //"fname" Validation.
    if (!fname) {
      return res.status(400).send({ status: false, msg: "fname Empty." });
    }
    if (fname) {
      if (fname === "" || fname.trim().length === 0) {
        return res.status(400).send({ status: false, msg: "fname Empty." });
      }
      if (!regex.test(fname)) {
        return res
          .status(400)
          .send({
            status: false,
            msg: "fname can be Alphabets, White-Space and Hyphen(-) ONLY.",
          });
      }
    }

    //"lname" Validation.
    if (!lname) {
      return res.status(400).send({ status: false, msg: "lname Empty." });
    }
    if (lname) {
      if (lname === "" || lname.trim().length === 0) {
        return res.status(400).send({ status: false, msg: "lname Empty." });
      }
      if (!regex.test(lname)) {
        return res
          .status(400)
          .send({
            status: false,
            msg: "lname can be Alphabets, White-Space and Hyphen(-) ONLY.",
          });
      }
    }

    //"title" Validation.
    if (!title) {
      return res.status(400).send({ status: false, msg: "title Empty." });
    }
    if (title) {
      if (title === "" || title.trim().length === 0) {
        return res.status(400).send({ status: false, msg: "title Empty." });
      }
      if (!(["Mr", "Mrs", "Miss", "Mast"].indexOf(title) !== -1)) {
        return res
          .status(400)
          .send({
            status: false,
            msg: "'title' can be 'Mr , 'Mrs' or 'Miss' ONLY.",
          });
      }
    }

    //"password" Validation.
    if (!password) {
      return res.status(400).send({ status: false, msg: "password Empty." });
    }
    if (password) {
      if (password === "" || password.trim().length === 0) {
        return res.status(400).send({ status: false, msg: "password Empty." });
      }
      if (password.length < 6 || password.length > 15) {
        return res
          .status(400)
          .send({
            status: false,
            msg: "'password' length should be between 6 and 15 characters",
          });
      }
    }

    //"email" Validation.
    if (!email) {
      return res.status(400).send({ status: false, msg: "email Empty." });
    }
    if (email) {
      if (email === "" || email.trim().length === 0) {
        return res.status(400).send({ status: false, msg: "email Empty." });
      }
      if (!isEmail(email)) {
        return res
          .status(400)
          .send({ status: false, msg: `'email'- '${email}' has Invalid Format.` });
      }
      const isEmailAlreadyUsed = await authorModel.findOne({ email });
      if (isEmailAlreadyUsed) {
        return res.status(400).send({
          status: false,
          message: `'${email}' email address is already registered`,
        });
      }
    }
    const finalData = await authorModel.create(authordata);
    // console.log(authordata);
    return res.status(201).send({ status: true, data: finalData });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};

/*-----------------------------------------------------------------------------------------
---------------------------- 2. API - GET Authors - -------------------------------------- -----------------------------------------------------------------------------------------*/
const getAuthors = async function (req, res) {
  try {
    const finalData = await authorModel.find();
    return res.status(200).send({ status: true, data: finalData });
  } catch (error) {
    console.log("error ", error.message);
    return res.status(500).send({ status: false, msg: error.message });
  }
};

/*-----------------------------------------------------------------------------------------
---------------------------- 3. API - Login Author --------------------------------------- -----------------------------------------------------------------------------------------*/
const loginAuthor = async function (req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const authorData = await authorModel.findOne({
      email: email,
      password: password,
    });

    ////~~~~~~~EMPTY BODY Validation:
    if (!Object.keys(req.body).length) {
      return res.status(400).send({ status: false, msg: "NO Data in BODY." });
    }

    //~~~~~~Credentials Verification:
    if (!authorData)
      return res.status(401).send({
        ///"401" - Invalid Credentials.
        status: false,
        msg: "Invalid Credentials. (Either username or the password is incorrect.)",
      });

    //~~~~~~~~Token Generation:
    const token = jwt.sign(
      {
        authorId: authorData._id.toString(),
        email: authorData.email,
      },
      "this-is-aSecretTokenForLogin" //Secret key
    );

    //Set Token in Response Header (NOT told acc. to Project):
    // res.setHeader("x-api-key", token);

    ////Print Contents of Token (Testing purpose):
    // let decodedToken = jwt.verify(token, "this-is-aSecretTokenForLogin");
    // console.log( `Contents of Token are = ${JSON.stringify(decodedToken)}` );

    //~~~~~~~~~~Send Successful Response.
    return res.status(200).send({
      status: true,
      msg: "Token Generated Successfully.",
      data: { token: token },
    });
  } catch (error) {
    return res.status(500).send({ msg: error.message });
  }
};

//Exported Functions
module.exports.authors = authors;
module.exports.getAuthors = getAuthors;
module.exports.loginAuthor = loginAuthor;
