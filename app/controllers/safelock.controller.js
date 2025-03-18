const db = require("../models");
const User = db.user;
const safe= db.safelock;
const deposit=db.deposit;
var request = require('request');
const {response} = require("express");
const {where} = require("sequelize");

exports.safelock =  async (req, res) => {
  const decryptedData = req.decryptedData;
  
  const userid = decryptedData.userId;
  var boy;
  try {
    if(decryptedData.amount===""){
      return res.status(200).send({status: "0", message: "Kindly enter your amount."});

    }
    if(decryptedData.tittle===""){
      return res.status(200).send({status: "0", message: "Kindly enter your tittle."});

    }
    if(decryptedData.date===""){
      return res.status(200).send({status: "0", message: "Kindly select your withdraw date."});

    }
    let authorities = [];

    const user = await User.findOne({
      where: {
        id: userid,
      },
    });

    if (!user) {
      // req.session = null;
      return res.status(200).send({status: "0", message: "Kindly login your account."});
    }
    var amount=decryptedData.amount;

    if (parseInt(user.wallet) < parseInt(decryptedData.amount)) {
      return  res.status(200).send({
        status:"0",
        balance:user.wallet,
        message:"insufficient balance"
      });
    }
    if (decryptedData.amount < 0)
    {
      return res.status(200).send({
        status: "0",
        message: "invalid transaction"
      });
    }
    var tamount=user.wallet - amount;

    const user1 = await User.update(
        { wallet: tamount },
        {
          where: {
            id: userid,
          },

        });

    const save =await safe.create({
      username:user.username,
      tittle:decryptedData.tittle,
      balance:decryptedData.amount,
      transactionid:decryptedData.refid,
      paymentmethod:"wallet",
      date:decryptedData.date,
      status:1,
    })

    var nodemailer = require('nodemailer');

    var transporter = nodemailer.createTransport({
      host: 'savebills.com.ng',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: 'info@savebills.com.ng',
        pass: 'W3lc0m32Z3f@'
      }
    });

    var mailOptions = {
      from: 'info@savebills.com.ng',
      to: user.email,
      subject: 'New Savelock Created',
      html: '<body style="width:100%;font-family:arial, \'helvetica neue\', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">\n' +
          '<div class="es-wrapper-color" style="background-color:#FAFAFA"><!--[if gte mso 9]>\n' +
          '    <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">\n' +
          '        <v:fill type="tile" color="#fafafa"></v:fill>\n' +
          '    </v:background>\n' +
          '    <![endif]-->\n' +
          '    <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#FAFAFA">\n' +
          '        <tr>\n' +
          '            <td valign="top" style="padding:0;Margin:0">\n' +
          '                <table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">\n' +
          '                    <tr>\n' +
          '                        <td align="center" style="padding:0;Margin:0">\n' +
          '                            <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">\n' +
          '                                <tr>\n' +
          '                                    <td align="left" style="padding:0;Margin:0;padding-top:15px;padding-left:20px;padding-right:20px">\n' +
          '                                        <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">\n' +
          '                                            <tr>\n' +
          '                                                <td align="center" valign="top" style="padding:0;Margin:0;width:560px">\n' +
          '                                                    <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">\n' +
          '                                                        <tr>\n' +
          '                                                            <td align="center" style="padding:0;Margin:0;padding-top:10px;padding-bottom:10px;font-size:0px"><img src="https://primedata.com.ng/lg.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="100" height="100"></td>\n' +
          '                                                        </tr>\n' +
          '                                                        <tr>\n' +
          '                                                            <td align="center" class="es-m-p0r es-m-p0l es-m-txt-c" style="Margin:0;padding-top:15px;padding-bottom:15px;padding-left:40px;padding-right:40px"><h1 style="Margin:0;line-height:30px;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;font-size:25px;font-style:normal;font-weight:bold;color:#333333"><strong>SAFELOCK ACCOUNT</strong></h1></td>\n' +
          '                                                        </tr>\n' +
          '                                                        <tr>\n' +
          '                                                            <td align="center" style="padding:0;Margin:0;padding-top:10px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px">Safeloc Successful Created Check Your Datail Below</p>\n' +
          '                                                                <ol>\n' +
          '                                                                    <li style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;Margin-bottom:15px;margin-left:0;color:#333333;font-size:14px;text-align:left">Title: ' + decryptedData.tittle+' </li>\n' +
          '                                                                    <li style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;Margin-bottom:15px;margin-left:0;color:#333333;font-size:14px;text-align:left">Username: '+user.username+'</li>\n' +
          '                                                                    <li style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;Margin-bottom:15px;margin-left:0;color:#333333;font-size:14px;text-align:left">Amount:₦'+ decryptedData.amount+' </li>\n' +
          '                                                                    <li style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;Margin-bottom:15px;margin-left:0;color:#333333;font-size:14px;text-align:left">Withdraw Date: ' + decryptedData.date+'</li>\n' +
          '                                                                </ol></td>\n' +
          '                                                        </tr>\n' +
          '                                                    </table></td>\n' +
          '                                            </tr>\n' +
          '                                        </table></td>\n' +
          '                                </tr>\n' +
          '                            </table></td>\n' +
          '                    </tr>\n' +
          '                </table>\n' +
          '                <table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">\n' +
          '                    <tr>\n' +
          '                        <td class="es-info-area" align="center" style="padding:0;Margin:0">\n' +
          '                            <table class="es-content-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px" bgcolor="#FFFFFF">\n' +
          '                                <tr>\n' +
          '                                    <td align="left" style="padding:20px;Margin:0">\n' +
          '                                        <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">\n' +
          '                                            <tr>\n' +
          '                                                <td align="center" valign="top" style="padding:0;Margin:0;width:560px">\n' +
          '                                                    <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">\n' +
          '                                                        <tr>\n' +
          '                                                            <td align="center" class="es-infoblock" style="padding:0;Margin:0;line-height:14px;font-size:12px;color:#CCCCCC"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:14px;color:#CCCCCC;font-size:12px"><a target="_blank" href="" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px"></a>No longer want to receive these emails?&nbsp;<a href="" target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px">Unsubscribe</a>.<a target="_blank" href="" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px"></a></p></td>\n' +
          '                                                        </tr>\n' +
          '                                                    </table></td>\n' +
          '                                            </tr>\n' +
          '                                        </table></td>\n' +
          '                                </tr>\n' +
          '                            </table></td>\n' +
          '                    </tr>\n' +
          '                </table></td>\n' +
          '        </tr>\n' +
          '    </table>\n' +
          '</div>\n' +
          '</body>\n'
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    return res.status(200).send({
      status:1,
      message:"Safe lock creat successfully",
    });

  } catch (error) {
    return res.status(201).send({
      message: error.message});
  }

};
