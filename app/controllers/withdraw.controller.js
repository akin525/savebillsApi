const db = require("../models");
const User = db.user;
const withdraw= db.withdraw;
const safelock=db.safelock;
var request = require('request');
const {response} = require("express");

exports.bank =  async (req, res) => {
    const userid = req.body.userId;
    var boy;
    try {


        const user = await User.findOne({
            where: {
                id: userid,
            },
        });

        if (!user) {
            return res.status(200).send({status: "0", message: "Kindly login your account."});
        }

        const safe =await  safelock.findOne({
            where:{
                username:user.username,
            },
        });
        if (req.body.amount < 0)
        {
            return res.status(200).send({
                status: "0",
                message: "invalid transaction"
            });
        }
        if (req.body.amount <500)
        {
            return res.status(200).send({
                status: "0",
                message: "Amount must not be lass than 500",
            });
        }
        if (parseInt(safe.balance) < parseInt(req.body.amount)) {
            return  res.status(200).send({
                status:"0",
                balance:safe.balance,
                message:"insufficient balance in safe-lock wallet"
            });
        }
        const rebalance=parseFloat(safe.balance)-parseFloat(req.body.amount);
        const objectToUpdate = {
            balance:rebalance,
        }
        safelock.findAll({ where: { id: safe.id}}).then((result) => {
            if(result){
                result[0].set(objectToUpdate);
                result[0].save();
            }
        });

        const insert = await withdraw.create({
            username:user.username,
            amount:req.body.amount,
            bank:req.body.bank,
            account_no:req.body.number,
            name:req.body.name,
            plan:req.body.code,
        });

        return res.status(200).send({
            status:1,
            message:"Withdraw Successful",
            insert:insert
        });

    } catch (error) {
        return res.status(201).send({
            message: error.message});
    }


};
