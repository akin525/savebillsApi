const db = require("../models");
const User = db.user;
const bill= db.bill;
const profit=db.profit;
const deposit=db.deposit;
const data=db.data;
var request = require('request');
const {response} = require("express");
const {where} = require("sequelize");
const nodemailer = require("nodemailer");

exports.otp =  async (req, res) => {
    const decryptedData = req.decryptedData;
    
    const userid = decryptedData.userId;

    var boy;
    try {


        return Math.floor(1000 + Math.random() * 9000);

        //

    } catch (error) {
        return res.status(201).send({ status:0,
            message: error.message});
    }


};;
