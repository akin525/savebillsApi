const db = require("../models");
const User = db.user;
const Bill= db.bill;
const { format } = require('date-fns');
const { Op } = require('sequelize');

const blockuser = async (req, res, next) => {
    const { userId } = req; // Assuming userId is passed as a URL parameter

    try {
        const user = await User.findOne({
            where: {
                id: userId,
            },
        });

        if (!user) {
            return res.status(200).send({ status: 0, message: "User not found." });
        }

        if (user.status === 0){
            return res.status(200).send({ status: 0, message: "User blacklist" });

        }
        next()
    } catch (error) {
        return res.status(500).send({
            status: "0",
            message: error.message
        });
    }
};

module.exports = {
    blockuser
};