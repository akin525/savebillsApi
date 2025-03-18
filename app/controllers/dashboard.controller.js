
const db = require("../models");
const {use} = require("express/lib/router");
const User = db.user;
const bill= db.bill;
const refer= db.refer;
const deposit=db.deposit;
const lock =db.safelock;
// const noti =db.messages;
const gmarket=db.gmarket;
const gateway=db.gateway;

exports.dashboard =  async (req, res) => {
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


        const gm= await gateway.findOne({
            where:{
                id:1,
            },
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
                bank:user.bank1,
                bank1:user.bank1,
                noti:"MTN & AIRTEL AWOOF DATA available. Get MTN 3.5GB for N540 only and AIRTEL 3GB @N537 only . Click on “Buy Data” and choose “MTN or AIRTEL” then “GIFTING” as Data Type. Select a plan and purchase",
                totalbill:totalbill??0,
                totaldeposit:totaldeposit??0,
                allock:allock??0,
                general_market:parseInt(gm.tamount),
                cashback:user.cashback,
                reward:user.reward,
                referbonus:referbonus??0,
                roles: user.role,
                applogin:user.applogin,
                timeappopen:user.timeappopen,
                fifteenMinRewarded: user["15minrewarded"],
                fiveminrewarded:user["5minrewarded"],
                earnrewardtime:user.earnrewardtime,
                earnrewardtimes:user.earnrewardtimes,
                day1:user.day1,
                day2:user.day2,
                day3:user.day3,
                day4:user.day4,
                day5:user.day5,
                day6:user.day6,
                day7:user.day7,

            }

        });
    } catch (error) {
        return res.status(500).send({message: error.message});
    }


};
