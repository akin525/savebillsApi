const db = require("../models");
const User = db.user;
const safe =db.safelock;
const deposit=db.deposit;
const chat=db.message;
var request = require('request');
const {response} = require("express");
const {where, Op} = require("sequelize");

exports.chatapi =  async (req, res) => {
  const decryptedData = req.decryptedData;

  const {senderId, recipientId}=decryptedData;

  try {
    const { senderId, recipientId } = decryptedData;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const history = await chat.findAll({
      where: {
        [Op.or]: [
          {
            senderId: senderId,
            recipientId: recipientId,
          },
          {
            senderId: recipientId,
            recipientId: senderId,
          },
          {
            senderId:0,
            recipientId:recipientId,
          },
          {
            senderId:recipientId,
            recipientId:0,
          },
          {
            senderId:0,
            recipientId:senderId,
          },
          {
            senderId:senderId,
            recipientId:0,
          }
        ]
      },
      limit,
      offset,
      order: [['id', 'DESC']] // Sort by createdAt, adjust as needed
    });

    const totalRecords = await chat.count({
      where: {
        [Op.or]: [
          { senderId, recipientId },
          { senderId: recipientId, recipientId: senderId }
        ]
      }
    });

    const totalPages = Math.ceil(totalRecords / limit);
    const nextPage = page < totalPages ? page + 1 : null;

    return res.status(200).send({
      status: 1,
      data: {
        message: history,
        currentPage: page,
        totalPages: totalPages,
        nextPage: nextPage ? `chathistory?page=${nextPage}&limit=${limit}` : null
      }
    });
  } catch (error) {
    return res.status(500).send({message: error.message});
  }

};
