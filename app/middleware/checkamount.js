const crypto = require("crypto");
const db = require("../models");
const User = db.settings;
const key = Buffer.from('12345678901234567890123456789012', 'utf-8'); // 32-byte key


checkamountcharacter = async (req, res, next) => {
    const user = await User.findOne({
      where: {
      id: 1,
      },
  });
  req.decryptedData = req.body;
  if(user.encryption === 1){

      const iv = Buffer.from(req.headers.timestamp, 'utf-8');                  // 16-byte IV

      const encryptedData = req.body.data;

      let encryptedText = Buffer.from(encryptedData, 'hex');
      let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      let value = JSON.parse(decrypted.toString());
      req.decryptedData = value;
  }

  const { amount } = req.body;
  const specialCharPattern = /[-+]/;


  try {

    if (specialCharPattern.test(amount)) {
      return res.status(200).send({
        status:0,
        message: 'Special characters found',
        requestNumber: amount
      });
    }


    if (!amount) {
      return res.status(200).send({ status: 0, message: "Kindly enter your amount." });
    }

    if (amount < 100) {
      return res.status(200).send({ status: 0, message: "Amount must not be less than 100" });
    }


    next();
  } catch (error) {
    return res.status(500).send({
      status: "0",
      message: error.message
    });
  }
};


const checkamount = {
  checkamountcharacter
};

module.exports = checkamount;
