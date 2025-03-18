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

exports.generateAccountall = async (req, res) => {
  try {
    const processResults = [];
    const td = await User.findAll();

    const user=td[0];
    // return  res.status(200).send({
    //   status: "1",
    //   user:user,
    //   message:td,
    // });

    // await Promise.all(users.map(async (user) => {
      try {
        // const options = createApiOptions(user);
        var options =  {
          'method': 'POST',
          'url': 'https://api.paylony.com/api/v1/create_account',
          'headers': {
            Authorization: 'Bearer sk_live_av30amcd3piinbfm48j0v8iv8sd5hm81rhqikjz'
          },
          formData:{
            "firstname": user.username,
            "lastname": user.name,
            "address": user.address,
            "gender": "Male",
            "email": user.email,
            "phone": user.phone,
            "dob": user.dob,
            "provider": "gtb"
          }
        };
        request(options, function (error, response) {
          if (error) {
            console.error(error);
            processResults.push({
              status: '0',
              message: error.message,
            });
            return;
          }

          const data1 = JSON.parse(response.body);
          console.log(data1.success);
          console.log(data1);
          if (data1.success === "true") { // Use boolean comparison instead of a string
            const objectToUpdate = {
              account_number2: data1.data.account_number,
              account_name2: data1.data.account_name,
              bank2: data1.data.provider,
            };

            // Find and update the user using async/await
            User.update(objectToUpdate, {
              where: { username: user.username },
              returning: true, // Return the updated user
            }).then(([updatedUser]) => {
              if (updatedUser) {
                processResults.push({
                  status: '1',
                  message: 'Account Generate Successful',
                  server_res: data1,
                });
              }
            }).catch((updateError) => {
              console.error(updateError);
              processResults.push({
                status: '0',
                message: updateError.message,
              });
            });
          } else {
            processResults.push({
              status: '0',
              message: data1.message,
            });
          }
        });
      } catch (error) {
        console.error(error);
        processResults.push({
          status: '0',
          message: error.message,
        });
      }
    // }));

  } catch (error) {
    console.error(error);
    return res.status(200).send({
      status: '0',
      message: error.message,
    });
  }
};

function createApiOptions(user) {
  var options = {
    method: 'POST',
    url: 'https://api.paylony.com/api/v1/create_account',
    headers: {
      Authorization: 'Bearer sk_live_av30amcd3piinbfm48j0v8iv8sd5hm81rhqikjz',
    },
    formData: {
      "firstname": user.username,
      "lastname": user.name,
      "address": user.address,
      "gender": "Male",
      "email": user.email,
      "phone": user.phone,
      "dob": user.dob,
      "provider": "safehaven",
    }
  };
  return options;
}

exports.generateaccountone = async (req, res) => {
  // return res.status(200).send({
  //   status: '1',
  //   message: decryptedData,
  // });

  const decryptedData = req.decryptedData;
  try {

    const users = await User.findOne({
      where: {
        username: decryptedData.username,
      },
    }); // Assuming productid is an array


    // Use Promise.all to parallelize requests
    //   var options = createApiOptions(users);

    var options =  {
      'method': 'POST',
      'url': 'https://api.paylony.com/api/v1/create_account/',
      'headers': {
        Authorization: 'Bearer sk_live_av30amcd3piinbfm48j0v8iv8sd5hm81rhqikjz'
      },
      formData:{
        "firstname": users.username,
        "lastname": users.name,
        "address": users.address,
        "gender": "Male",
        "email": users.email,
        "phone": users.phone,
        "dob": users.dob,
        "provider": "gtb"
      }
    };

    request(options, function (error, response) {
      if (error) throw new Error(error);
      const data = JSON.parse(response.body);
      console.log(data.success);
        console.log(data);
        const objectToUpdate = {
          account_number2: data.data.account_number,
          account_name2: data.data.account_name,
          bank2: data.data.provider,
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
