const db = require("../models");
const User = db.user;
const bill= db.bill;
const deposit=db.deposit;
exports.purchase =  async (req, res) => {
    const userid = req.userId;
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
        const allbill =await bill.findAll({
            where:{
                username:user.username,
            },
        });
        return res.status(200).send({status:1,data:{ bill:allbill}});
    } catch (error) {
        return res.status(500).send({message: error.message});
    }

    res.status(200).send("User Content.");

};
