const db = require("../models");
const User = db.user;
const bill= db.bill;
const deposit=db.deposit;
var request = require('request');
const {response} = require("express");
const {where} = require("sequelize");
const { body, validationResult } = require('express-validator');
const nodemailer = require("nodemailer");
const setting=db.gateway;
const set=db.settings;
require('dotenv').config();

exports.airtimenewencry = async (req, res) => {
    try {
        // Get API key from headers
        const apiKey = req.headers['x-api-key']; // Use 'x-api-key' or 'authorization'
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

        const decryptedData = req.body;
        const settings = await set.findOne({ where: { id: 1 } });

        if (settings.airtime === 0) {
            return res.status(503).send({ status: 0, message: "Service temporarily unavailable" });
        }

        const { number, amount, network, refid } = decryptedData;

        // Input validation
        if (!number || !network || !amount || !refid) {
            return res.status(400).send({ status: 0, message: "Missing required fields" });
        }

        // Ensure sufficient balance
        if (parseInt(user.wallet) < parseInt(amount)) {
            return res.status(400).send({ status: 0, balance: user.wallet, message: "Insufficient balance" });
        }

        // Check for duplicate transactions
        const existingBill = await bill.findOne({ where: { refid } });
        if (existingBill) {
            return res.status(409).send({ status: 0, message: "Duplicate transaction" });
        }

        // Network mapping
        const networkMap = { m: "MTN", g: "GLO", a: "AIRTEL", "9": "9MOBILE" };
        const net = networkMap[network] || "UNKNOWN";

        if (amount <= 0 || amount > 3000) {
            return res.status(400).send({ status: 0, message: "Amount must be between 1 and 3000" });
        }

        // Deduct amount from wallet
        const updatedWallet = parseInt(user.wallet) - parseInt(amount);
        await User.update({ wallet: updatedWallet }, { where: { id: user.id } });

        // Create bill record
        const newBill = await bill.create({
            username: user.username,
            plan: `Airtime--${net}`,
            amount,
            server_res: "airtime",
            result: "0",
            phone: number,
            refid,
            paymentmethod: "wallet",
        });

        // Call third-party API
        const options = {
            method: 'POST',
            url: process.env.Airtime_Url,
            headers: {
                'Authorization': `Bearer ${process.env.Authorize_Key}`,
                'Content-Type': 'application/json',
            },
            formData: {
                provider: net,
                amount,
                number,
                country: 'NG',
                payment: 'wallet',
                promo: '0',
                ref: refid,
                operatorID: 0,
            },
        };

        request(options, async (error, response) => {
            if (error) {
                return res.status(500).send({ status: 0, message: "Transaction failed", error: error.message });
            }

            const data = JSON.parse(response.body);
            if (data.success === 1) {
                await bill.update({ result: 1, server_res: response.body }, { where: { id: newBill.id } });
                return res.status(200).send({
                    status: 1,
                    data: {
                        user: user.username,
                        message: `Airtime successfully delivered to ${number}`,
                        server_res: response.body,
                    },
                });
            } else {
                // Refund money if transaction fails
                await User.update({ wallet: parseInt(user.wallet) + parseInt(amount) }, { where: { id: user.id } });
                return res.status(500).send({
                    status: 0,
                    message: "Transaction failed, refund issued",
                    server_res: response.body,
                });
            }
        });
    } catch (error) {
        return res.status(500).send({ status: 0, message: "Internal server error", error: error.message });
    }
};


exports.airtimepin =  async (req, res) => {

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

    const decryptedData = req.decryptedData;
    const setting1 = await setting.findOne({
        where: {
            id: 1,
        },
    });
    const settingss = await set.findOne({
        where: {
            id: 1,
        },
    });
    if (settingss.airtimepin ===0) {
        return res.status(200).send({status: 0, message: "service temporary unavailable."});
    }
    const {  amount, network, number,  refid,  } = decryptedData;


    try {
        const errors = validationResult(decryptedData);
        if (!errors.isEmpty()) {
            return res.status(200).json({
                status: 0,
                msg: 'Errors',
                errors: errors.array()
            });
        }

            if (parseInt(user.wallet) < parseInt(amount)) {
                return res.status(200).send({
                    status: 0,
                    balance: user.wallet,
                    message: "Insufficient balance"
                });
            }

        const existingBill = await bill.findOne({where: {refid}});

        if (existingBill) {
            return res.status(200).send({status: 0, message: "Duplicate transaction"});
        }

        if (amount < 0) {
            return res.status(200).send({status: "0", message: "Invalid transaction"});
        }

        const newBill = await bill.create({
            username: user.username,
            plan: "Airtime--" + network,
            amount,
            server_res: "airtime",
            result: "0",
            phone: number,
            refid
        });
        const bo="Airtime Successfully Delivered To "+req.body.number;
            function calculatePercentage(amount) {
                if (typeof amount !== 'number' || isNaN(amount)) {
                    throw new Error('The input should be a valid number.');
                }
                const percentage = (2 / 100) * amount;
                return percentage;
            }

            const result = calculatePercentage(parseInt(amount));

            const cash = parseFloat(user.cashback) + result;

            const updatedWallet = parseInt(user.wallet) - parseInt(amount);

            await User.update({wallet: updatedWallet}, {where: {id: userId}});


            var options =
                {
                    'method': 'POST',


                    'url': process.env.Airtimepin_Url,
                    'headers': {
                        'Authorization': 'Bearer ' + process.env.Authorize_Key,
                        'Content-Type': 'application/json'
                    },
                    formData: {
                        'provider': network,
                        'amount': amount,
                        'number': number,
                        'payment': 'wallet',
                        'promo': '0',
                        'ref': refid,
                        'quantity': 1
                    }
                };
            request(options, function (error, response) {
                if (error) throw new Error(error);
                var data = JSON.parse(response.body);
                console.log(data.success);
                if (data.success === 1) {
                    console.log(data);
                    const objectToUpdate = {
                        result: 1,
                        server_res: response.body,
                        token: data.token
                    }

                    bill.findAll({where: {id: newBill.id}}).then((result) => {
                        if (result) {
                            result[0].set(objectToUpdate);
                            result[0].save();
                        }
                    })


                    return res.status(200).send({
                        status: 1,
                        data: {
                            user: user.username,
                            message: "Airtime-Pin Successfully Delivered To " + number,
                            server_res: response.body,
                            token: data.token
                        }

                    });
                } else {
                    const back = parseInt(user.wallet) + parseInt(amount);
                    return res.status(200).send({
                        status: 1,
                        data: {
                            user: user.username,
                            message: "Airtime-pin Successfully Delivered To " + req.body.number,
                            server_res: response.body
                        }
                    });
                }

            });

            //

    } catch (error) {
        return res.status(201).send({
            message: error.message});
    }


};
