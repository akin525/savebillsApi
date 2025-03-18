const db = require("../models");
const User = db.user;
const bill= db.bill;
const deposit=db.deposit;
var request = require('request');
const {response} = require("express");
const {where} = require("sequelize");

exports.profile =  async (req, res) => {
  const decryptedData = req.decryptedData;
  
  const userid = decryptedData.userId;

  var boy;
  try {
    let authorities = [];
    var amount=decryptedData.amount;

    const user = await User.findOne({
      where: {
        id: userid,
      },
    });

    if (!user) {
      // req.session = null;
      return res.status(200).send({status: "0", message: "Kindly login your account."});
    }

    const objectToUpdate = {
     name:decryptedData.name,
     email:decryptedData.email,
     phone:decryptedData.number,
    }
    User.findAll({ where: { id: userid}}).then((result) => {
      if(result){
        result[0].set(objectToUpdate);
        result[0].save();
      }
    })

    return res.status(200).send({
      status:1,
      message:"Profile Update Successfully",
    });

  } catch (error) {
    return res.status(201).send({
      message: error.message});
  }

};
