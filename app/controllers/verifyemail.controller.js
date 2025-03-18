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
const otp=db.otp;
exports.verifyemail =  async (req, res) => {
    const decryptedData = req.decryptedData;

    var boy;
    try {


        const user1 = await otp.findOne({
            where: {
                pin: decryptedData.otp,
            },
        });

        if (!user1) {
            // req.session = null;
            return res.status(200).send({status: 0, message: "incorrect otp supply"});
        }
        const user=await User.findOne({
            where:{
                username:user1.username,
            },
        });
        const objectToUpdate = {
            is_verify:"true",
        }
        User.findAll({ where: { id: user.id}}).then((result) => {
            if(result){
                result[0].set(objectToUpdate);
                result[0].save();
            }
        })
        return res.status(200).send({status: 1, message: "email verify successful"});

        //

    } catch (error) {
        return res.status(201).send({ status:0,
            message: error.message});
    }


};