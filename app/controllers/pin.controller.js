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

exports.createpin =  async (req, res) => {
    const decryptedData = req.decryptedData;
    const userid = decryptedData.userId;

    var boy;
    try {

        if(decryptedData.userId===""){
            return res.status(200).send({status: 0, message: "Kindly provide userId."});

        }

        if(decryptedData.pin ===""){
            return res.status(200).send({status: 0, message: "Kindly provide your pin."});

        }
        let authorities = [];

        const user = await User.findOne({
            where: {
                id: userid,
            },
        });

        if (!user) {
            // req.session = null;
            return res.status(200).send({status: 0, message: "Kindly login your account."});
        }
        const objectToUpdate = {
            pin:decryptedData.pin,
        }
        User.findAll({ where: { id: userid}}).then((result) => {
            if(result){
                result[0].set(objectToUpdate);
                result[0].save();
            }
        })
        return res.status(200).send({status: 1, message: "Pin Created Success"});

        //

    } catch (error) {
        return res.status(201).send({ status:0,
            message: error.message});
    }


};
exports.changepin =  async (req, res) => {
    const userid = decryptedData.userId;

    var boy;
    try {

        if(decryptedData.userId===""){
            return res.status(200).send({status: 0, message: "Kindly provide userId."});

        }

        if(decryptedData.pin ===""){
            return res.status(200).send({status: 0, message: "Kindly provide your pin."});

        }

        if(decryptedData.oldpin ===""){
            return res.status(200).send({status: 0, message: "Kindly provide old pin."});

        }

        const user = await User.findOne({
            where: {
                id: userid,
            },
        });

        if (!user) {
            // req.session = null;
            return res.status(200).send({status: 0, message: "Kindly login your account."});
        }

        if (decryptedData.oldpin != user.pin){
            return res.status(200).send({status: 0, message: "Incorrect Old Pin"});
        }

        const objectToUpdate = {
            pin:decryptedData.pin,
        }
        User.findAll({ where: { id: userid}}).then((result) => {
            if(result){
                result[0].set(objectToUpdate);
                result[0].save();
            }
        })
        return res.status(200).send({status: 1, message: "Pin Change successful"});

        //

    } catch (error) {
        return res.status(201).send({ status:0,
            message: error.message});
    }


};
