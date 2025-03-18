const db = require("../models");
const User = db.user;
const bill= db.bill;
const data=db.data;
var request = require('request');
const {response} = require("express");

exports.bank =  async (req, res) => {
    const userid = req.body.userId;
    var boy;
    try {
        var options = {
            method: 'GET',
            url: 'https://sandbox.monnify.com/api/v1/disbursements/account/validate',
            headers: {
                Authorization: ' Basic TUtfVEVTVF9LUFoyQjJUQ1hLOkJERkJZUUtRSEVHR1NCOFJFODI3VlRGODhYVEJQVDJN',
                'Cache-Control': 'no-cache'
            },
            qs: {
                accountNumber: req.body.number,
                bankCode: req.body.bank
            }
        };
        request(options, function (error, response) {
            if (error) console.log(error);
            var data=JSON.parse(response.body);
            console.log(data);
            res.status(200).send(data);

        });


    } catch (error) {
        return res.status(201).send({
            message: error.message});
    }


};
