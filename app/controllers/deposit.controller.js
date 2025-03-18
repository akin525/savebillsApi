const db = require("../models");
const User = db.user;
const deposit=db.deposit;
exports.alldeposit =  async (req, res) => {
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
        const alldepo =await deposit.findAll({
            where:{
                username:user.username,
            },
        });
        return res.status(200).send({
            status:1,
            data:{
                deposit:alldepo
            }
        });
    } catch (error) {
        return res.status(500).send({message: error.message});
    }

    res.status(200).send("User Content.");

};
