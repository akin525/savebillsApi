const db = require("../models");
const chat=db.message;
const User = db.user;
const safe =db.safelock;
const deposit=db.deposit;
var request = require('request');
const {response} = require("express");
const {where, Op} = require("sequelize");


exports.adminchatapi = async (req, res) => {
  try {
    const history = await chat.findAll({
      where: {
        [Op.or]: [
          { senderId: 0, recipientId: { [Op.ne]: 0 } },
          { recipientId: 0, senderId: { [Op.ne]: 0 } },
        ],
      },
      order: [['id', 'DESC']],
      include: [
        { model: User, as: 'Sender', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'Recipient', attributes: ['id', 'name', 'email'] },
      ],
    });

    // Create a map to track the last record for each unique (senderId, recipientId) pair
    const uniqueChatsMap = new Map();
    history.forEach(chat => {
      if (chat.senderId !== null && chat.recipientId !== null) {
        const pair = `${chat.senderId}-${chat.recipientId}`;
        if (!uniqueChatsMap.has(pair)) {
          uniqueChatsMap.set(pair, chat);
        }
      }
    });

    const uniqueChats = Array.from(uniqueChatsMap.values());

    return res.status(200).send({ status: 1, chats: uniqueChats });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};



