const jwt = require("jsonwebtoken");
const authorModel = require("../Models/authorModel");

/*-----------------------------------------------------------------------------------------
---------------------------- 1. API - Create Author -------------------------------------- -----------------------------------------------------------------------------------------*/
const authors = async function (req, res) {
  try {
    const authordata = req.body;
    const finalData = await authorModel.create(authordata);
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
