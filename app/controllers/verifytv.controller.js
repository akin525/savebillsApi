const db = require("../models");
const User = db.user;
const bill= db.bill;
const deposit=db.deposit;
const data=db.data;
var request = require('request');
const {response} = require("express");
const {where} = require("sequelize");

exports.verifytv =  async (req, res) => {
    const decryptedData = req.decryptedData;
    
    const userid = decryptedData.userId;

    var boy;
    try {

        var options = {
            'method': 'POST',
            'url': process.env.VERIFY_TV_Url,
            'headers': {
                'Authorization': 'Bearer '+process.env.Authorize_Key,
                'Content-Type': 'application/json'
            },
            formData: {
                'service': 'tv',
                'provider': decryptedData.network,
                'number': decryptedData.number
            }
        };

        request(options, function (error, response) {
            if (error) console.log(error);
            var data=JSON.parse(response.body);
            console.log(data.message);
            if (data.success===1){
                console.log(data);

                return   res.status(200).send({
                    status:1,
                    message:data.data,
                });
            } else if (data.success===0) {
              return   res.status(200).send({
                    status: 0,
                    message: data
                });
            }
            res.status(200).send(response.body);

        });

        //

    } catch (error) {
        return res.status(201).send({
            message: error.message});
    }


};
