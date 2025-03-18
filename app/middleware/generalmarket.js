const db = require("../models");
const User = db.user;
const Bill= db.bill;
const { format } = require('date-fns');
const { Op } = require('sequelize');
const setting=db.gateway;

const checkMyTransaction = async (req, res, next) => {
    const { userId, amount } = req; // Assuming userId is passed as a URL parameter
    const setting1 = await setting.findOne({
        where: {
            id: 1,
        },
    });
    try {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        console.log("formattedDate");
        console.log(formattedDate);

        if (amount != null) {
            if (amount > 300){
                return { status: 2, message: "Maximum amount u can use is 300" };

            }
            if (parseInt(setting1.tamount) < parseInt(amount)) {

                return { status: 2, message: "Insufficient generalmarket" };

            }
        }
        const user = await User.findOne({
            where: {
                id: userId,
            },
        });

        if (!user) {
            // return res.status(200).send({ status: 0, message: "User not found." });
            return { status: 2, message: "User not found." };

        }

        const countuse = await Bill.count({
            where: {
                username: user.username,
                paymentmethod:"generalmarket",
                createdAt: {
                    [Op.gte]: new Date(formattedDate),
                    [Op.lt]: new Date(new Date(formattedDate).setDate(new Date(formattedDate).getDate() + 1))
                }
            }
        });
        if (countuse >= 2) {
            // return res.status(200).send({ status: 0, message: "you have exceeded the number of general-market per day" });
            return { status: 2, message: "you have exceeded the number of general-market per day" };

        }


        const transactionCount = await Bill.count({
            where: {
                username: user.username,
                createdAt: {
                    [Op.gte]: new Date(formattedDate),
                    [Op.lt]: new Date(new Date(formattedDate).setDate(new Date(formattedDate).getDate() + 1))
                }
            }
        });

        console.log("transactionCount");
        console.log(transactionCount);

        if (transactionCount >= 2) {
            return { status: 1, message: "User has reached the transaction limit for today." };
        } else {
            return { status: 2, message: "User has not reached the transaction limit for today." };
        }

    } catch (error) {

        return { status: 2, message: error.message };


    }
};

module.exports = {
    checkMyTransaction
};