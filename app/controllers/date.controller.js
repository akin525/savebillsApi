const db = require("../models");
const User = db.user;
const safe =db.safelock;
const intt =db.interest;
const deposit=db.deposit;
var request = require('request');
const {response} = require("express");
const {where} = require("sequelize");

exports.add =  async (req, res) => {
  const userid = req.body.userId;

  var boy;
  try {

    const dat6 =new Date().toISOString().split('T')[0];
    const user=await safe.findAll({
      where:{
        date:dat6,
      },
    });


    user.forEach(function (element){

      const objectToUpdate = {
        status:0,
      };


      element.set(objectToUpdate);
      element.save();



    });
    res.status(200).send({
      sp:user,
      date:dat6,
    });
  } catch (error) {
    return res.status(201).send({
      message: error.message});
  }

};
