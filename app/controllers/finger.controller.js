const db = require("../models");
const {use} = require("express/lib/router");
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const User = db.user;
const bill= db.bill;
const refer= db.refer;
const deposit=db.deposit;
const lock =db.safelock;
const gmarket=db.gmarket;
const gateway=db.gateway;

exports.finger =  async (req, res) => {
    const decryptedData = req.decryptedData;

    const userid = decryptedData.userId;
    try {
        let authorities = [];

        const user = await User.findOne({
            where: {
                id: userid,
            },
        });
        if (!user) {
            // req.session = null;
            return res.status(200).send({status: "0", message: "Kindly login your account."});
        }
        const totalbill= await bill.sum('amount',{
            where:{
                username:user.username,
            },
        });
        const totaldeposit=await deposit.sum('amount', {
            where:{
                username:user.username,
            },
        });

        const allbill =await bill.findAll({
            where:{
                username:user.username,
            },
        });
        const allock = await lock.sum('balance',{
            where:{
                username:user.username,
            },
        });

        const referbonus= await refer.sum('amount', {
            where:{
                username:user.username,
                status:1,
            },
        });

        // const notification= await noti.findOne({
        //     where:{
        //         status:1,
        //     },
        // });

        const gm= await gateway.findOne({
            where:{
                id:1,
            },
        });
        const token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: 86400, // 24 hours
        });

        return res.status(200).send({
            status:1,
            data:{id: user.id,
                is_verify:user.is_verify,
                pin:user.pin,
                name: user.name,
                username: user.username,
                email: user.email,
                phone: user.phone,
                apikey:user.apikey,
                wallet: parseInt(user.wallet),
                account_number: user.account_number,
                account_number1: user.account_number1,
                account_name: user.account_name,
                account_name1: user.account_name1,
                bank:user.bank,
                token:token,
                bank1:user.bank1,
                noti:"hello",
                totalbill:totalbill??0,
                totaldeposit:totaldeposit??0,
                allock:allock??0,
                general_market:parseInt(gm.tamount),
                // bills:allbill,
                referbonus:referbonus??0,
                roles: authorities}

        });
    } catch (error) {
        return res.status(500).send({status:0, message: error.message});
    }

    res.status(200).send("User Content.");

};
