const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

checkDuplicateUsernameOrEmail = async (req, res, next) => {
  try {

    if (req.body.username===""){
      return res.status(200).send({
        status: "0",
        message: "Enter your username!"
      });
    }
    if (req.body.name===""){
      return res.status(200).send({
        status: "0",
        message: "Enter your full-name!"
      });
    }
    // if (req.body.phone===""){
    //   return res.status(200).send({
    //     status: "0",
    //     message: "Enter your phone number"
    //   });
    // }
    if (req.body.email===""){
      return res.status(200).send({
        status: "0",
        message: "Enter your email address"
      });
    }
    if (!isValidEmail(req.body.email)) {
      console
      return res.status(200).send({
        status: "0",
        message: "Invalid email address"
      });
    }
    // if (req.body.dob===""){
    //   return res.status(200).send({
    //     status: "0",
    //     message: "Enter your date of birth"
    //   });
    // }
    // if (req.body.address===""){
    //   return res.status(200).send({
    //     status: "0",
    //     message: "Enter your address"
    //   });
    // }
    // if (req.body.gender===""){
    //   return res.status(200).send({
    //     status: "0",
    //     message: "select your gender"
    //   });
    // }
    if (req.body.username.toString().length < 5){
      return res.status(200).send({
        status: 0,
        message: "Username must be more than 6 value!"
      });
    }
    // if (req.body.username.toString().length < 5){
    //   return res.status(200).send({
    //     status: 0,
    //     message: "Username must be more than 6 value!"
    //   });
    // }

    // if (req.body.phone.toString().length < 11){
    //   return res.status(200).send({
    //     status: "0",
    //     message: "phone number must be up to 11 digit!"
    //   });
    // }
    // Username
    let user = await User.findOne({
      where: {
        username: req.body.username
      }
    });

    if (user) {
      return res.status(200).send({
        status: "0",
        message: "Failed! Username is already in use!"
      });
    }

    // Email
    user = await User.findOne({
      where: {
        email: req.body.email
      }
    });

    if (user) {
      return res.status(200).send({
        status: "0",
        message: "Failed! Email is already in use!"
      });
    }

    next();
  } catch (error) {
    return res.status(500).send({
      status: "0",
      message: error.message
    });
  }
};

checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(200).send({
          status: "0",
          message: "Failed! Role does not exist = " + req.body.roles[i]
        });
        return;
      }
    }
  }
  
  next();
};

function isValidEmail(email) {
console.log("hello am hear");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted
};

module.exports = verifySignUp;
