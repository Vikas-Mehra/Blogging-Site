const authorModel = require("../Models/authorModel");
const jwt = require('jsonwebtoken');


const createAuthor = async function (req, res) {
  try {
    const authordata = req.body;
    const finalData = await authorModel.create(authordata);
    res.send({ msg: finalData });
  } catch (error) {
    console.log("this is the error ", error.message);
    res.status(500).send({ msg: error.message });
  }
};

const getAuthors = async function (req, res) {
  try {
    const finalData = await authorModel.find();
    res.send({ msg: finalData });
  } catch (error) {
    console.log("this is the error ", error.message);
    res.status(500).send({ msg: error.message });
  }
};

const loginAuthor = async function (req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const authorData = await authorModel.findOne({
      email: email,
      password: password,
    });
    console.log(authorData);
    if (!authorData)
      return res.status(401).send({
        status: false,
        msg: "Either username or the password is incorrect",
      });

    const token = jwt.sign(
      {
        authorId: authorData._id.toString(),
        email: authorData.email,
      },
      "this-is-aSecretTokenForLogin" //Secret key
    );
    res.setHeader("x-api-key", token);
    res.status(201).send({
      status: true,
      msg: "token generated successfully.",
      data: { token: token },
    });
  } catch (error) {
    console.log("this is the error ", error.message);
    res.status(500).send({ msg: error.message });
  }
};

module.exports.createAuthor = createAuthor;
module.exports.getAuthors = getAuthors;
module.exports.loginAuthor = loginAuthor;
