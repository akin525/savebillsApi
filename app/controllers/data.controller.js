const db = require("../models");
const User = db.user;
const bill= db.bill;
const data=db.data;
const datanew=db.datanew;
const Server=db.dataserver;
var request = require('request');
const {response} = require("express");

exports.data = async (req, res) => {
    const decryptedData = req.decryptedData;

    try {
        const allplan = await datanew.findAll({
            where: {
                network: decryptedData.network,
                status: '1',
            },
        });

        // Round up all amount values
        const updatedPlans = allplan.map(plan => {
            const planData = plan.toJSON();
            return {
                ...planData,
                amount: Math.ceil(Number(planData.amount)).toString(),   // Convert to number and round up
                tamount: Math.ceil(Number(planData.tamount)).toString(), // Convert to number and round up
                ramount: Math.ceil(Number(planData.ramount)).toString()  // Convert to number and round up
            };
        });

        return res.status(200).send({
            status: 1,
            data: {
                plan: updatedPlans
            }
        });

    } catch (error) {
        return res.status(500).send({
            message: error.message
        });
    }
};
exports.datanew = async (req, res) => {
    const decryptedData = req.decryptedData;

    try {
        const server = await Server.findOne({
            where: {
                status: 1,
            },
        });

        let allplan = [];
        if (decryptedData.network === "smile") {
            allplan = await datanew.findAll({
                where: {
                    network: decryptedData.network,
                    status: '1',
                },
            });
        } else {
            allplan = await datanew.findAll({
                where: {
                    network: decryptedData.network,
                    status: '1',
                    server: server.code,
                },
            });
        }

        // Round up all amount values and convert to strings
        allplan = allplan.map(plan => {
            const planData = plan.toJSON();
            return {
                ...planData,
                amount: Math.ceil(Number(planData.amount)).toString(),   // Round up and convert to string
                tamount: Math.ceil(Number(planData.tamount)).toString(), // Round up and convert to string
                ramount: Math.ceil(Number(planData.ramount)).toString()  // Round up and convert to string
            };
        });

        return res.status(200).send({
            status: 1,
            data: {
                plan: allplan
            }
        });

    } catch (error) {
        return res.status(500).send({
            message: error.message
        });
    }
};
exports.datapin=  async (req, res) => {
    const decryptedData = req.decryptedData;

    var boy;
    try {



        const server = await Server.findOne({
            where:{
                status:1,
            },
        });


        const allplan= await datanew.findAll({
            where:{
                network:decryptedData.network,
                // category:decryptedData.category,
                status:'1'
            },
        });

        // console.log(allplan);
        return res.status(200).send({
            status:1,
            data:{
               plan: allplan
            }
        });

    } catch (error) {
        return res.status(201).send({
            message: error.message});
    }

};
