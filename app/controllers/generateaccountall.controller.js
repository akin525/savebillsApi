const db = require("../models");
const User = db.user;
const safe =db.safelock;
const deposit=db.deposit;
const product=db.data;
const bill= db.bill;
var request = require('request');
const {response} = require("express");
const {where} = require("sequelize");

const axios = require('axios');
// const User = require('./User'); // Make sure to import the User model from the correct path

const requestPromise = require('request-promise');

exports.generateAccountall = async (req, res) => {
  try {
    const processResults = [];
    const users = await User.findAll();

    // Process users in batches
    const batchSize = 10; // Adjust based on your needs
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);

      await Promise.all(batch.map(async (user) => {
        try {
          const options = createApiOptions(user);
          const response = await requestPromise(options);
          const data1 = JSON.parse(response);

          if (data1.success === "true") {
            const objectToUpdate = {
              account_number2: data1.data.account_number,
              account_name2: data1.data.account_name,
              bank2: data1.data.provider,
            };

            await User.update(objectToUpdate, {
              where: { username: user.username },
            });

            processResults.push({
              status: '1',
              message: 'Account Generate Successful',
              server_res: data1,
            });
          } else {
            processResults.push({
              status: '0',
              message: data1.message,
            });
          }
        } catch (error) {
          console.error(error);
          processResults.push({
            status: '0',
            message: error.message,
          });
        }
      }));
    }

    return res.status(200).send({
      status: '1',
      message: 'Account Generation Process Completed',
      results: processResults,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      status: '0',
      message: error.message,
    });
  }
};

function createApiOptions(user) {
  return {
    method: 'POST',
    url: 'https://api.paylony.com/api/v1/create_account',
    headers: {
      Authorization: 'Bearer sk_live_av30amcd3piinbfm48j0v8iv8sd5hm81rhqikjz',
    },
    formData: {
      "firstname": user.username,
      "lastname": user.name,
      "address": user.address,
      "gender": user.gender,
      "email": user.email,
      "phone": user.phone,
      "dob": user.dob,
      "provider": "netbank",
    }
  };
}

exports.generateaccountone = async (req, res) => {
  // return res.status(200).send({
  //   status: '1',
  //   message: decryptedData.userId,
  // });
  const decryptedData = req.decryptedData;
  try {

    const users = await User.findOne({
      where: {
        id: decryptedData.userId,
      },
    }); // Assuming productid is an array


    // Use Promise.all to parallelize requests
    //   var options = createApiOptions(users);

    var options =  {
      'method': 'POST',
      'url': 'https://api.paylony.com/api/v1/create_account',
      'headers': {
        Authorization: 'Bearer sk_live_av30amcd3piinbfm48j0v8iv8sd5hm81rhqikjz'
      },
      formData:{
        "firstname": users.username,
        "lastname": users.name,
        "address": "Lagos Nigeria",
        "gender": "Male",
        "email": users.email,
        "phone": "07040237649",
        "dob": "1995-01-03",
        "provider": "netbank"
      }
    };


    request(options, function (error, response) {
      if (error) throw new Error(error);
      const data = JSON.parse(response.body);
      console.log(data.success);
        console.log(data);
        const objectToUpdate = {
          account_number: data.data.account_number,
          account_name: data.data.account_name,
          bank1: data.data.provider,
        };
        User.findAll({ where: { username: users.username}}).then((result) => {
          if(result){
            result[0].set(objectToUpdate);
            result[0].save();
          }
        })

        return  res.status(200).send({
          status: "1",
          user:users.username,
          message:"Account Generated Successful",
          server_res:data
        });

      // res.status(200).send(response.body);

    });
  } catch (error) {
    console.error(error);
    return res.status(200).send({
      status: '0',
      body:decryptedData.username,
      message: error.message,
    });
  }

};
