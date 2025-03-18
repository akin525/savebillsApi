const crypto = require('crypto');
const db = require("../models");
const Setting = db.settings;
const checkMyTransaction =require("../middleware/generalmarket");
// Define the constant key and IV
const key = Buffer.from('12345678901234567890123456789012', 'utf-8'); // 32-byte key

const encryptMiddleware  = async (req, res, next) => {
    const user = await User.findOne({
        where: {
          encryption: decryptedData.username,
        },
      });
      return user;
      if(user.encryption === 1){
            const text = req.body.text;

            let cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
            let encrypted = cipher.update(text);
            encrypted = Buffer.concat([encrypted, cipher.final()]);

            req.body = {
                iv: iv.toString('hex'),
                encryptedData: encrypted.toString('hex')
            };
        }

    next();
}

const decryptMiddleware = async(req, res, next) =>{
    const on = await Setting.findOne({
        where: {
        id: 1,
        },
    });

    req.decryptedData = req.body;


    if(on.encryption === 1){

        const iv = Buffer.from(req.headers.timestamp, 'utf-8');                  // 16-byte IV

        const encryptedData = req.body.data;

       if (!encryptedData){

           return res.status(200).send({
               status: 0,
               message: "Kindly download the new updated app on playstore:https://play.google.com/store/apps/details?id=com.a5starcompany.paysave || apple-store:https://apps.apple.com/us/app/savebill/id1670003926",

           });
       }
        // try{

        let encryptedText = Buffer.from(encryptedData, 'hex');

        let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        // console.log(decrypted);

        let value = JSON.parse(decrypted.toString());
        req.decryptedData = value;
        // } catch (error) {
        //     console.log(error);
        // }
    }

    if(req.decryptedData.paymentmethod === "generalmarket") {
        const check = await checkMyTransaction.checkMyTransaction(req.decryptedData,res,next)
        if (check.status === 1){
            next();
        }else {
            return res.status(200).send({ status: 0, message: check.message });
        }
    }else{
        next();
    }
}

module.exports = {
    encryptMiddleware,
    decryptMiddleware
};
