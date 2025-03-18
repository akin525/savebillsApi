const db = require("../models");
const User = db.user;
const safe =db.safelock;
const deposit=db.deposit;
var request = require('request');
const {response} = require("express");
const {where} = require("sequelize");
const {validationResult} = require("express-validator");
const {now} = require("sequelize/lib/utils");

exports.reward = async (req, res) => {
  const decryptedData = req.decryptedData;
  const errors = validationResult(decryptedData);

  if (!errors.isEmpty()) {
    return res.status(200).json({
      status: 0,
      msg: 'Errors',
      errors: errors.array()
    });
  }

  const { userId, amount, rewardtype } = decryptedData;
  const userid = userId;

  try {
    const user = await User.findOne({
      where: { id: userid }
    });

    if (!user) {
      return res.status(200).send({ status: "0", message: "Kindly login your account." });
    }

    if (amount === "") {
      return res.status(200).send({ status: "0", message: "Kindly enter your amount." });
    }

    const rebalance = parseInt(user.reward) + parseInt(amount);

    let updateData = { reward: rebalance };

    switch (rewardtype) {
      case "day1":
        updateData.day1 = 1;
        break;
      case "day2":
        updateData.day2 = 1;
        break;
      case "day3":
        updateData.day3 = 1;
        break;
      case "day4":
        updateData.day4 = 1;
        break;
      case "day5":
        updateData.day5 = 1;
        break;
      case "day6":
        updateData.day6 = 1;
        break;
      case "day7":
        updateData.day7 = 1;
        break;
      case "applogin":
        updateData.applogin = true;
        break;
      case "fiveminrewarded":
        updateData["5minrewarded"] = true;
        break;
      case "fifteenMinRewarded":
        updateData["15minrewarded"] = true;
        break;
      case "earnrewardtimes":
        const currentRewardTimes = user.earnrewardtimes || 0;
        updateData.earnrewardtime = new Date();
        updateData.earnrewardtimes = currentRewardTimes + 1;
        break;
      default:
        return res.status(200).send({ status: "0", message: "Invalid reward type." });
    }

    await User.update(updateData, {
      where: { id: userid }
    });

    return res.status(200).send({
      status: 1,
      data: {
        message: "Amount added successfully"
      }
    });

  } catch (error) {
    return res.status(500).send({
      message: error.message
    });
  }
};
