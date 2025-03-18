const db = require("../models");
const User = db.user;
const bill= db.bill;
const data3=db.data;
const datanew=db.datanew;

var request = require('request');
const {response} = require("express");
const axios = require('axios');

exports.listdata = async (req, res) => {
    try {
        const options = {
            method: 'Get',
            url: 'https://reseller.mcd.5starcompany.com.ng/api/v1/data/MTN',
            headers: {
                'Authorization': 'mcd_key_yhij3dui0678iujk23hegwtfyu23dwky'
            },
            data: {
                service: 'data',
                coded:"9"
            }
        };

        const response = await axios(options);
        const data = response.data.data; // Assuming the response contains JSON data

        const processedData = data.map(process => {
            return {
                plan_id: process.code,
                network: process.type,
                plan: process.name,
                code: process.code,
                amount: process.amount,
                tamount: process.amount,
                ramount: process.amount
            };
        });

        // Assuming 'data3' is a model you want to use for saving data to a database
        // Assuming 'create' is a method to create a new record
        for (const process of processedData) {
            await data3.create(process);
        }

        return res.status(200).json(response.data.data);
    } catch (error) {
        return res.status(500).send({
            message: error.message
        });
    }
};
exports.listtv = async (req, res) => {
    try {
        const options = {
            method: 'GET',
            url: 'https://reseller.mcd.5starcompany.com.ng/api/v1/data/'+req.body.network,
            headers: {
                'Authorization': 'Bearer ChBfBAKZXxBhVDM6Vta54LAjNHcpNSzAhUcgmxr274wUetwtgGbbOJ1Uv0HoQckSLK8o9VIs1YlUUzP6ONe7rpXY2W7hg2YlYxcO7fJOP8uUPe3SG8hVKUwbrkkgmX4piw2yipJbY6R1tK5MyIFZYn',
                'Content-Type': 'application/json'
            },
        };

        const response = await axios(options);
        const data = response.data.data; // Assuming the response contains JSON data

        const processedData = data.map(process => {
            return {
                plan_id: process.coded,
                network: process.type,
                plan: process.name,
                code: process.coded,
                category: "tv",
                // server: process.server,
                amount: process.price,
                tamount: process.price,
                ramount: process.price,
                cat_id: process.coded
            };
        });
        return res.status(200).json(response.data.data);

        // Assuming 'data3' is a model you want to use for saving data to a database
        // Assuming 'create' is a method to create a new record
        for (const process of processedData) {
            await datanew.create(process);
        }

        return res.status(200).json(response.data.data);
    } catch (error) {
        return res.status(500).send({
            message: error.message
        });
    }
};
exports.listdatapin = async (req, res) => {
    try {
        const options = {
            method: 'GET',
            url: 'https://reseller.mcd.5starcompany.com.ng/api/v1/datapins',
            headers: {
                'Authorization': 'Bearer ChBfBAKZXxBhVDM6Vta54LAjNHcpNSzAhUcgmxr274wUetwtgGbbOJ1Uv0HoQckSLK8o9VIs1YlUUzP6ONe7rpXY2W7hg2YlYxcO7fJOP8uUPe3SG8hVKUwbrkkgmX4piw2yipJbY6R1tK5MyIFZYn',
                'Content-Type': 'application/json'
            },
        };

        const response = await axios(options);
        const data = response.data.data; // Assuming the response contains JSON data

        const processedData = data.map(process => {
            return {
                plan_id: process.code,
                network: "datapin",
                plan: process.name,
                code: process.code,
                category: process.type,
                amount: process.amount,
                tamount: process.amount,
                ramount: process.amount,
                cat_id: process.code
            };
        });
        // return res.status(200).json(response.data.data);

        // Assuming 'data3' is a model you want to use for saving data to a database
        // Assuming 'create' is a method to create a new record
        for (const process of processedData) {
            await datanew.create(process);
        }

        return res.status(200).json(response.data.data);
    } catch (error) {
        return res.status(500).send({
            message: error.message
        });
    }
};
