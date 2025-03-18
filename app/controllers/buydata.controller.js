const db = require("../models");
const User = db.user;
const bill= db.bill;
const profit=db.profit;
const deposit=db.deposit;
const data=db.data;
const datanew=db.datanew;
var request = require('request');
const {response} = require("express");
const {where} = require("sequelize");
const nodemailer = require("nodemailer");
const gmarket=db.gmarket;
const gateway=db.gateway;
require('dotenv').config();


exports.buydatanewencry =  async (req, res) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        return res.status(401).send({ status: 0, message: "Unauthorized: API key missing" });
    }

    const user = await User.findOne({ where: { apikey: apiKey } });
    if (!user) {
        return res.status(401).send({ status: 0, message: "Unauthorized: Invalid API key" });
    }

    if (user.status === 0) {
        return res.status(403).send({ status: 0, message: "User is blacklisted" });
    }

    const setting1 = await gateway.findOne({
        where: {
            id: 1,
        },
    });
    if (setting1.data ===0) {
        return res.status(200).send({status: 0, message: "service temporary unavailable."});
    }
    const decryptedData = req.decryptedData;

    const { number, id, refid } = decryptedData;


    if (!number) {
        return res.status(200).send({ status: 0, message: "Kindly enter your phone number." });
    }
    if (!id) {
        return res.status(200).send({ status: 0, message: "Kindly select your network." });
    }

    try {


        const product = await datanew.findOne({
            where: {
                id,
            },
        });

        if (!product) {
            return res.status(200).send({
                status: 0,
                message: "Product not found"
            });
        }

        const amount = product.tamount;
            return res.status(200).send({
                status: 0,
                balance: user.wallet,
                message: "Insufficient balance"
            });

        const totalbill = await bill.findOne({
            where: {
                refid,
            },
        });

        if (totalbill) {
            return res.status(200).send({
                status: 0,
                message: "Duplicate transaction"
            });
        }



        const bil = await bill.create({
            username: user.username,
            plan: product.plan,
            amount: product.tamount,
            server_res: "data",
            result: "0",
            phone: number,
            refid: refid,
            paymentmethod:"wallet",
        });

        const profits = amount - product.amount;
        const pro = await profit.create({
            username: user.username,
            amount: profits,
            plan: product.plan,
        });

            const tamount = parseInt(user.wallet) - parseInt(amount);
            await User.update(
                { wallet: tamount },
                {
                    where: {
                        id: userId,
                    },
                }
            );



        var options = {
            'method': 'POST',
            'url': process.env.BuyData_Url,
            'headers': {
                'Authorization': 'Bearer '+process.env.Authorize_Key,
                'Content-Type': 'application/json'
            },
            formData: {
                'payment': 'wallet',
                'coded': product.plan_id,
                'number': number,
                'ref':refid,
                'country':'NG',
                'promo':'0'
            }
        };

        request(options, function (error, response) {
            if (error) console.log(error);
            var data=JSON.parse(response.body);
            console.log(data.message);
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



                const update={
                    tamount:gbonus,
                }

                gateway.findAll({where:{ id:1,}}).then((result)=>{
                    if (result){
                        result[0].set(update);
                        result[0].save();
                    }
                })
                return   res.status(200).send({
                    status: 1,
                    data:{
                        user:user.username,
                        message:product.plan+" Was Successfully Delivered To "+number,
                        server_res:response.body
                    }

                });
            } else if (data.success===0) {

              return   res.status(200).send({
                    status: 0,
                    message: data.message
                });
            }
            res.status(200).send(response.body);

        });

    } catch (error) {
        return res.status(201).send({
            message: error.message});
    }


};
