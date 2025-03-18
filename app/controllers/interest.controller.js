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

    const interest=10;
    const user=await safe.findAll({
      where:{
        status:1,
      },
    });

    user.forEach(function (element){
      const cala=interest/100 * element.balance;
      const calapday =cala/365;
      const username =element.username;
      const insert= intt.create({
        username:username,
        profit:calapday,
      });
      const allsave=parseFloat(element.balance)+parseFloat(calapday);
      const objectToUpdate = {
        balance:allsave,
      };


      element.set(objectToUpdate);
      element.save();



    });
    res.status(200).send({
      sp:user,
    });
  } catch (error) {
    return res.status(201).send({
      message: error.message});
  }

};
