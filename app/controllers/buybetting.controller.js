const db = require("../models");
const User = db.user;
const bill= db.bill;
const deposit=db.deposit;
var request = require('request');
const {response} = require("express");
const {where} = require("sequelize");
const { body, validationResult } = require('express-validator');
const nodemailer = require("nodemailer");

exports.bet =  async (req, res) => {

    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        return res.status(401).send({ status: 0, message: "Unauthorized: API key missing" });
    }

    // Find the user by API key
    const user = await User.findOne({ where: { apikey: apiKey } });
    if (!user) {
        return res.status(401).send({ status: 0, message: "Unauthorized: Invalid API key" });
    }

    // Ensure the user is active
    if (user.status === 0) {
        return res.status(403).send({ status: 0, message: "User is blacklisted" });
    }

    try {
        if(req.body.amount===""){
            return res.status(200).send({status: "0", message: "Kindly enter your amount."});

        }
        if (req.body.amount <100)
        {
            return res.status(200).send({
                status: "0",
                message: "Amount must not be lass than 100",
            });
        }
        if(req.body.number===""){
            return res.status(200).send({status: "0", message: "Kindly enter your phone number."});

        }
        if(req.body.network===""){
            return res.status(200).send({status: "0", message: "Kindly select your network."});

        }

        let authorities = [];
        var amount=req.body.amount;
        if (parseInt(user.wallet) < parseInt(req.body.amount)) {
           return  res.status(200).send({
                status:"0",
               balance:user.wallet,
                message:"insufficient balance"
            });
        }

        const totalbill= await bill.findOne({
            where:{
                refid:req.body.refid,
            },
        });
        if (totalbill)
        {
            return res.status(200).send({
                status: "0",
                message: "duplicate transaction"
            });
        }
        if (req.body.amount < 0)
        {
            return res.status(200).send({
                status: "0",
                message: "invalid transaction"
            });
        }
        if (req.body.amount >3000)
        {
            return res.status(200).send({
                status: "0",
                message: "Amount must be lass than 3000",
            });
        }
        var tamount=parseInt(user.wallet) - parseInt(amount);

        const user1 = await User.update(
            { wallet: tamount },
            {
                where: {
                    id: userid,
                },
            });

    const bil= await bill.create({
            username:user.username,
            plan:"Betting--"+req.body.network,
            amount:req.body.amount,
            server_res:"airtime",
        result:"0",
        phone:req.body.number,
        refid:req.body.refid,

        });
        const bo="betting Fund Successfully Delivered To "+req.body.number;


        var options =
            {
            'method': 'POST',


            'url': process.env.Betting_Url,
            'headers': {
                'Authorization': 'Bearer '+process.env.Authorize_Key,
                'Content-Type': 'application/json'
            },
            formData: {
                'payment': 'wallet',
                'provider': req.body.network,
                'number': req.body.number,
                'amount': req.body.amount,
                'promo': '0',
                'ref':req.body.refid
            }
        };
        request(options, function (error, response) {
            if (error) throw new Error(error);
            var data=JSON.parse(response.body);
            console.log(data.success);
            if (data.success===1){
                console.log(data);
                const objectToUpdate = {
                    result:1,
                    server_res:response.body
                }

                bill.findAll({ where: { id: bil.id}}).then((result) => {
                    if(result){
                        result[0].set(objectToUpdate);
                        result[0].save();
                    }
                })



                return   res.status(200).send({
                    status: 1,
                    data:{
                        user:user.username,
                        message:"Betting Fund Successfully Delivered To "+req.body.number,
                        server_res:response.body
                    }

                });
            } else if (data.success===0) {
                const back =parseInt(user.wallet) + parseInt(amount);
                // const user12 =  User.update(
                //     { wallet: back },
                //     {
                //         where: {
                //             id: userid,
                //         },
                //     });
              return   res.status(200).send({
                    status: "0",
                    message: data.message,
                  up:user1
                });
            }
            // res.status(200).send(response.body);

        });

        //

    } catch (error) {
        return res.status(201).send({
            message: error.message});
    }


};
