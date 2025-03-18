const db = require("../models");
const User = db.user;
const bill= db.bill;
const data=db.data;
var request = require('request');
const {response} = require("express");

exports.upgrade =  async (req, res) => {
    const decryptedData = req.decryptedData;
    
    const userid = decryptedData.userId;
    const amount=1000;
    var boy;
    try {
        let authorities = [];

        const user= await User.findOne({
            where:{
                id:userid,
            },
        });

        if (!user) {
            // req.session = null;
            return res.status(200).send({status: 0, message: "Kindly login your account."});
        }
        if (user.apikey!=null){
            return res.status(200).send({
                status:0,
                message:"Account already upgraded",
            });
        }
        if (parseInt(user.wallet) < amount) {
            return  res.status(200).send({
                status:0,
                balance:user.wallet,
                message:"insufficient balance"
            });
        }

        const tamunt= parseInt(user.wallet)-1000;

        const apikey = 'SB.KEY'+Math.floor(Math.random() * (99999999999999999999999999999999999999999999 - 11111111111111111111111111111111111 ));

        const objectToUpdate = {
            apikey:apikey,
            wallet:tamunt,
        }

        User.findAll({ where: { id: userid}}).then((result) => {
            if(result){
                result[0].set(objectToUpdate);
                result[0].save();
            }
        })
        return res.status(200).send(
            {
                status:1,
                message:"Account Upgraded Successfully",
            }
        );

    } catch (error) {
        return res.status(201).send({
            message: error.message});
    }

    res.status(200).send("User Content.");

};
