const db = require("../models");
const User = db.user;
const bill= db.bill;
const data=db.datanew;
var request = require('request');
const {response} = require("express");

exports.tv =  async (req, res) => {
    const decryptedData = req.decryptedData;
    
    const userid = decryptedData.userId;
    var boy;
    try {
        let authorities = [];


        const allplan= await data.findAll({
            where:{
                network:decryptedData.network,
            },
        });

        // console.log(allplan);
        return res.status(200).send(
            {
                status:1,
                data:{
                   plan: allplan
                }
            }
    );

    } catch (error) {
        return res.status(201).send({
            message: error.message});
    }

    res.status(200).send("User Content.");

};
