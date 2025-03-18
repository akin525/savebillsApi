const db = require("../models");
const User = db.user;
const bill= db.bill;
const withdraw= db.withdraw;
const data=db.data;
var request = require('request');
const {response} = require("express");

exports.bank =  async (req, res) => {
    const userid = req.body.userId;
    var boy;
    try {


        var options = {
            'method': 'GET',
            'url': 'https://api.paystack.co/bank',
            'headers': {
                "Authorization": "Bearer sk_test_280c68e08f76233b476038f04d92896b4749eec3",
                "Cache-Control": "no-cache"
            },
        };
        request(options, function (error, response) {
            if (error) console.log(error);
            var data=JSON.parse(response.body);
            console.log(data);

            res.status(200).send(response.body);

        });


    } catch (error) {
        return res.status(201).send({
            message: error.message});
    }


};
