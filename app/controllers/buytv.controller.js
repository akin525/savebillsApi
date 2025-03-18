const db = require("../models");
const User = db.user;
const bill= db.bill;
const deposit=db.deposit;
const data=db.datanew;
var request = require('request');
const {response} = require("express");
const {where} = require("sequelize");
const nodemailer = require("nodemailer");

exports.buytv =  async (req, res) => {
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

    try {

        const user = await User.findOne({
            where: {
                id: userid,
            },
        });


        const product= await data.findOne({
            where:{
                id:req.body.id,
            },
        });
        if (!product) {
            return res.status(200).send({
                status: 0,
                message: "Product not found"
            });
        }
        const amount=product.tamount;
        const o=User.wallet < product.tamount;
        console.log("user.wallet");
        console.log(user.wallet);
        console.log(product.tamount);
        if (parseInt(user.wallet) < parseInt(product.tamount))
        {
            return  res.status(200).send({
                status:"0",
                mu:o,
                se:product.tamount,
                balance:user.wallet,
                message:"insufficient balance"
            });
        }
        if (req.body.amount < 0)
        {
            return res.status(200).send({
                status: "0",
                message: "invalid transaction"
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
        var tamount=parseInt(user.wallet) - parseInt(amount);

        const user1 = await User.update(
            { wallet: tamount },
            {
                where: {
                    id: userid,
                },

            });
        // console.log("user1");
        console.log(user1);

        const bil= await bill.create({
            username:user.username,
            plan:product.plan,
            amount:product.tamount,
            server_res:"tv",
            result:"0",
            phone:req.body.number,
            refid:req.body.refid,

        });

        var options = {
            'method': 'POST',
            'url': 'https://reseller.mcd.5starcompany.com.ng/api/v1/tv',
            'headers': {
                'Authorization': 'Bearer ChBfBAKZXxBhVDM6Vta54LAjNHcpNSzAhUcgmxr274wUetwtgGbbOJ1Uv0HoQckSLK8o9VIs1YlUUzP6ONe7rpXY2W7hg2YlYxcO7fJOP8uUPe3SG8hVKUwbrkkgmX4piw2yipJbY6R1tK5MyIFZYn',
                'Content-Type': 'application/json'
            },

            formData: {
                "coded": product.cat_id,
                "number": req.body.number,
                "payment": "wallet",
                "promo": "0",
                "ref": req.body.refid
            }
        };

        request(options, function (error, response) {
            if (error) console.log(error);
            var data=JSON.parse(response.body);
            console.log(data);
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
                        message:product.plan+" Was Successfully Delivered To "+req.body.number,
                        server_res:response.body
                    }

                });
            } else if (data.success===0) {
                const back =parseInt(user.wallet) + parseInt(amount);
                return   res.status(200).send({
                    status: "0",
                    message: data.message
                });
            }
            res.status(200).send(response.body);

        });


        //

    } catch (error) {
        return res.status(201).send({
            message: error.message});
    }


};
