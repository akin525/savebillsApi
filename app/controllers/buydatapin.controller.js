const db = require("../models");
const User = db.user;
const bill= db.bill;
const profit=db.profit;
const deposit=db.deposit;
const data=db.data;
const datanew=db.datanew;
var request = require('request');
const {response} = require("express");
const {where} = require("sequelize");
const nodemailer = require("nodemailer");
const gmarket=db.gmarket;
const gateway=db.gateway;
require('dotenv').config();

exports.buydatapin =  async (req, res) => {
    const setting1 = await gateway.findOne({
        where: {
            id: 1,
        },
    });
    if (setting1.datapin ===0) {
        return res.status(200).send({status: 0, message: "service temporary unavailable."});
    }
    const decryptedData = req.decryptedData;

    const { userId, number, id, network, refid, paymentmethod: originalPaymentMethod } = decryptedData;


    let paymentmethod = originalPaymentMethod;


    var boy;
    try {
        if(!number){
            return res.status(200).send({status: "0", message: "Kindly enter your phone number."});

        }

        if(!id){
            return res.status(200).send({status: 0, message: "Kindly select your network."});

        }
        let authorities = [];

        const user = await User.findOne({
            where: {
                id: userId,
            },
        });

        if (!user) {
            // req.session = null;
            return res.status(200).send({status: 0, message: "Kindly login your account."});
        }
        if (user.status === 0){
            return res.status(200).send({ status: 0, message: "User blacklist" });

        }

        const product= await datanew.findOne({
            where:{
                id,
            },
        });
        if(!product){
            return res.status(200).send({
                status:0,
                message:"product not Found"
            });
        }
        const amount=product.tamount;
const o=User.wallet < product.tamount;
        if (paymentmethod === "wallet") {
            if (parseInt(user.wallet) < parseInt(amount)) {
                return res.status(200).send({
                    status: 0,
                    balance: user.wallet,
                    message: "Insufficient balance"
                });
            }
        } else if (paymentmethod === "generalmarket") {

            console.log(setting1.tamount);
            if (parseInt(setting1.tamount) < parseInt(amount)) {
                return res.status(200).send({
                    status: 0,
                    balance: user.wallet,
                    message: "Insufficient generalmarket"
                });
            }
        }


        const totalbill= await bill.findOne({
            where:{
                refid:req.body.refid,
            },
        });
        if (totalbill)
        {
            return res.status(200).send({
                status: "0",
                message: "duplicate transaction"
            });
        }
        if (req.body.amount < 0)
        {
            return res.status(200).send({
                status: "0",
                message: "invalid transaction"
            });
        }

        const gm= await gateway.findOne({
            where:{
                id:1,
            },
        });


        if (paymentmethod === "wallet") {
            const gbonus= parseInt(gm.amount) + parseInt(gm.tamount);
            var tamount=parseInt(user.wallet) - parseInt(amount);
            var profits=amount-product.amount;
            const user1 = await User.update(
                { wallet: tamount },
                {
                    where: {
                        id: userId,
                    },

                });
            const cc=await gmarket.create({
                product:product.plan,
                amount:gm.amount,
            });
        } else if (paymentmethod === "generalmarket") {
            const updatedWallet1 = parseInt(setting1.tamount) - parseInt(amount);
            await gateway.update({tamount: updatedWallet1}, {where: {id: 1}});
        }


        const bil= await bill.create({
            username:user.username,
            plan:product.plan,
            amount:product.tamount,
            server_res:"data",
        result:"0",
        phone:req.body.number,
        refid:req.body.refid,

        });
        const cc=await gmarket.create({
            product:product.plan,
            amount:gm.amount,
        });
        const pro= await  profit.create({
            username:user.username,
            amount:profits,
            plan:product.plan,
        });

        var options = {
            'method': 'POST',
            'url': process.env.BuyDatapin_Url,
            'headers': {
                'Authorization': 'Bearer '+process.env.Authorize_Key,
                'Content-Type': 'application/json'
            },
            formData: {
                'payment': 'wallet',
                'coded': product.plan_id,
                'number': req.body.number,
                'ref':req.body.refid,
                'country':'NG',
                'promo':'0',
                'quantity': '1'
            }
        };

        request(options, function (error, response) {
            if (error) console.log(error);
            var data=JSON.parse(response.body);
            console.log(data.message);
            if (data.success===1){
                console.log(data);

                const objectToUpdate = {
                    result:1,
                    server_res:response.body,
                    token:response.body.token

                }

                bill.findAll({ where: { id: bil.id}}).then((result) => {
                    if(result){
                        result[0].set(objectToUpdate);
                        result[0].save();
                    }
                })



                const update={
                    tamount:gbonus,
                }

                gateway.findAll({where:{ id:1,}}).then((result)=>{
                    if (result){
                        result[0].set(update);
                        result[0].save();
                    }
                })
                var nodemailer = require('nodemailer');

                var transporter = nodemailer.createTransport({
                    host: process.env.MAIL_HOST,
                    port: process.env.MAIL_PORT,
                    secure: true, // use SSL
                    auth: {
                        user: process.env.MAIL_FROM_ADDRESS,
                        pass: process.env.MAIL_PASSWORD
                    }
                });

                var mailOptions = {
                    from: process.env.MAIL_FROM_ADDRESS,
                    to: `${process.env.MAIL_FROM_ADDRESS}, ${user.email}`,
                    subject: user.username+' Transaction',
                    html: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="font-family:arial, \'helvetica neue\', helvetica, sans-serif"><head><meta charset="UTF-8"><meta content="width=device-width, initial-scale=1" name="viewport"><meta name="x-apple-disable-message-reformatting"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta content="telephone=no" name="format-detection"><title>New Template 2</title><!--[if (mso 16)]><style type="text/css">     a {text-decoration: none;}     </style><![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]><xml> <o:OfficeDocumentSettings> <o:AllowPNG></o:AllowPNG> <o:PixelsPerInch>96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml><![endif]--><!--[if !mso]><!-- --><link href="https://fonts.googleapis.com/css?family=Merriweather:400,400i,700,700i" rel="stylesheet"><link href="https://fonts.googleapis.com/css?family=Merriweather+Sans:400,400i,700,700i" rel="stylesheet"><!--<![endif]--><style type="text/css">#outlook a {\tpadding:0;}.es-button {\tmso-style-priority:100!important;\ttext-decoration:none!important;}a[x-apple-data-detectors] {\tcolor:inherit!important;\ttext-decoration:none!important;\tfont-size:inherit!important;\tfont-family:inherit!important;\tfont-weight:inherit!important;\tline-height:inherit!important;}.es-desk-hidden {\tdisplay:none;\tfloat:left;\toverflow:hidden;\twidth:0;\tmax-height:0;\tline-height:0;\tmso-hide:all;}[data-ogsb] .es-button {\tborder-width:0!important;\tpadding:10px 30px 10px 30px!important;}@media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120%!important } h1 { font-size:36px!important; text-align:left } h2 { font-size:26px!important; text-align:left } h3 { font-size:20px!important; text-align:left } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:36px!important; text-align:left } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:26px!important; text-align:left } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important; text-align:left } .es-menu td a { font-size:12px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:14px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:14px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:inline-block!important } a.es-button, button.es-button { font-size:20px!important; display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0!important } .es-m-p0r { padding-right:0!important } .es-m-p0l { padding-left:0!important } .es-m-p0t { padding-top:0!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-m-p5 { padding:5px!important } .es-m-p5t { padding-top:5px!important } .es-m-p5b { padding-bottom:5px!important } .es-m-p5r { padding-right:5px!important } .es-m-p5l { padding-left:5px!important } .es-m-p10 { padding:10px!important } .es-m-p10t { padding-top:10px!important } .es-m-p10b { padding-bottom:10px!important } .es-m-p10r { padding-right:10px!important } .es-m-p10l { padding-left:10px!important } .es-m-p15 { padding:15px!important } .es-m-p15t { padding-top:15px!important } .es-m-p15b { padding-bottom:15px!important } .es-m-p15r { padding-right:15px!important } .es-m-p15l { padding-left:15px!important } .es-m-p20 { padding:20px!important } .es-m-p20t { padding-top:20px!important } .es-m-p20r { padding-right:20px!important } .es-m-p20l { padding-left:20px!important } .es-m-p25 { padding:25px!important } .es-m-p25t { padding-top:25px!important } .es-m-p25b { padding-bottom:25px!important } .es-m-p25r { padding-right:25px!important } .es-m-p25l { padding-left:25px!important } .es-m-p30 { padding:30px!important } .es-m-p30t { padding-top:30px!important } .es-m-p30b { padding-bottom:30px!important } .es-m-p30r { padding-right:30px!important } .es-m-p30l { padding-left:30px!important } .es-m-p35 { padding:35px!important } .es-m-p35t { padding-top:35px!important } .es-m-p35b { padding-bottom:35px!important } .es-m-p35r { padding-right:35px!important } .es-m-p35l { padding-left:35px!important } .es-m-p40 { padding:40px!important } .es-m-p40t { padding-top:40px!important } .es-m-p40b { padding-bottom:40px!important } .es-m-p40r { padding-right:40px!important } .es-m-p40l { padding-left:40px!important } .es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; max-height:inherit!important } }</style></head>\n' +
                        '<body style="width:100%;font-family:arial, \'helvetica neue\', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0"><div class="es-wrapper-color" style="background-color:#FAFAFA"><!--[if gte mso 9]><v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t"> <v:fill type="tile" color="#fafafa"></v:fill> </v:background><![endif]--><table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#FAFAFA"><tr><td valign="top" style="padding:0;Margin:0"><table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%"><tr><td align="center" style="padding:0;Margin:0"><table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px"><tr><td align="left" style="padding:0;Margin:0;padding-top:15px;padding-left:20px;padding-right:20px"><table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td align="center" valign="top" style="padding:0;Margin:0;width:560px"><table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td align="center" style="padding:0;Margin:0;padding-top:10px;padding-bottom:10px;font-size:0px"><img src="https://lgftzw.stripocdn.email/content/guids/CABINET_05246376297d4f2be005783076e6e0ac/images/lg.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="100" height="95"></td>\n' +
                        '</tr><tr><td align="center" class="es-m-txt-c" style="padding:0;Margin:0;padding-bottom:10px"><h1 style="Margin:0;line-height:46px;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;font-size:46px;font-style:normal;font-weight:bold;color:#333333"><strong>Transaction Record</strong></h1></td></tr></table></td></tr></table></td></tr></table></td>\n' +
                        '</tr></table><table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%"><tr><td align="center" style="padding:0;Margin:0"><table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px"><tr><td align="left" style="padding:20px;Margin:0"><table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td align="center" valign="top" style="padding:0;Margin:0;width:560px"><table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td align="center" class="es-m-txt-c" style="padding:0;Margin:0"><h2 style="Margin:0;line-height:31px;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;font-size:26px;font-style:normal;font-weight:bold;color:#333333">Refid&nbsp;<a target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#3d85c6;font-size:26px" href="">' + req.body.refid+'</a>&nbsp;has been recorded!&nbsp;</h2>\n' +
                        '</td></tr><tr><td align="center" style="padding:0;Margin:0;padding-bottom:15px;padding-top:25px"><span class="es-button-border" style="border-style:solid;border-color:#3d85c6;background:#6fa8dc;border-width:2px;display:inline-block;border-radius:6px;width:auto"><a href="" class="es-button" target="_blank" style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;color:#FFFFFF;font-size:20px;border-style:solid;border-color:#6fa8dc;border-width:10px 30px 10px 30px;display:inline-block;background:#6fa8dc;border-radius:6px;font-family:arial, \'helvetica neue\', helvetica, sans-serif;font-weight:normal;font-style:normal;line-height:24px;width:auto;text-align:center;border-left-width:30px;border-right-width:30px">' + user.name+'</a></span></td>\n' +
                        '</tr><tr><td align="center" style="padding:0;Margin:0;padding-bottom:20px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px"><strong>DATE:&nbsp;</strong>&nbsp;<strong>' + new Date()+'</strong></p></td></tr></table></td></tr></table></td>\n' +
                        '</tr><tr><td align="left" style="padding:0;Margin:0;padding-top:10px;padding-left:20px;padding-right:20px"><table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td class="es-m-p0r" align="center" style="padding:0;Margin:0;width:560px"><table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;border-top:2px solid #efefef;border-bottom:2px solid #efefef" role="presentation"><tr><td align="left" style="padding:0;Margin:0"><ul><li style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;Margin-bottom:15px;margin-left:0;color:#333333;font-size:14px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:\'merriweather sans\', \'helvetica neue\', helvetica, arial, sans-serif;line-height:21px;color:#333333;font-size:14px"><strong>Product:' + product.plan+'</strong></p>\n' +
                        '</li><li style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;Margin-bottom:15px;margin-left:0;color:#333333;font-size:14px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:\'merriweather sans\', \'helvetica neue\', helvetica, arial, sans-serif;line-height:21px;color:#333333;font-size:14px"><strong>Amount: NGN' + product.tamount+'</strong></p></li>\n' +
                        '<li style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;Margin-bottom:15px;margin-left:0;color:#333333;font-size:14px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:\'merriweather sans\', \'helvetica neue\', helvetica, arial, sans-serif;line-height:21px;color:#333333;font-size:14px"><strong>Refid: ' + req.body.refid+'</strong></p></li>\n' +
                        '<li style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;Margin-bottom:15px;margin-left:0;color:#333333;font-size:14px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:\'merriweather sans\', \'helvetica neue\', helvetica, arial, sans-serif;line-height:21px;color:#333333;font-size:14px"><strong>Phone Number; ' + req.body.number+'</strong></p></li>\n' +
                        '<li style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;Margin-bottom:15px;margin-left:0;color:#333333;font-size:14px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:\'merriweather sans\', \'helvetica neue\', helvetica, arial, sans-serif;line-height:21px;color:#333333;font-size:14px"><strong>Balance: NGN' + tamount+'</strong></p></li>\n' +
                        '<li style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;Margin-bottom:15px;margin-left:0;color:#333333;font-size:14px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:\'merriweather sans\', \'helvetica neue\', helvetica, arial, sans-serif;line-height:21px;color:#333333;font-size:14px"><strong>Date: ' + new Date()+'</strong></p></li></ul></td></tr></table></td></tr></table></td>\n' +
                        '</tr><tr><td align="left" style="Margin:0;padding-bottom:10px;padding-top:15px;padding-left:20px;padding-right:20px"><table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td align="left" style="padding:0;Margin:0;width:560px"><table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td align="center" style="padding:0;Margin:0;padding-top:10px;padding-bottom:10px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px">If you have any questions/issues, please contact us at&nbsp;<a href="mailto:info@savebills.com.ng" target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#5C68E2;font-size:14px">info@savebills.com.ng</a><br>Thanks for choosing us</p>\n' +
                        '</td></tr></table></td></tr></table></td></tr></table></td>\n' +
                        '</tr></table><table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%"><tr><td class="es-info-area" align="center" style="padding:0;Margin:0"><table class="es-content-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px" bgcolor="#FFFFFF"><tr><td align="left" style="padding:20px;Margin:0"><table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td align="center" valign="top" style="padding:0;Margin:0;width:560px"><table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td align="center" class="es-infoblock" style="padding:0;Margin:0;line-height:14px;font-size:12px;color:#CCCCCC"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:14px;color:#CCCCCC;font-size:12px"><a target="_blank" href="" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px"></a>No longer want to receive these emails?&nbsp;<a href="" target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px">Unsubscribe</a>.<a target="_blank" href="" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px"></a></p>\n' +
                        '</td></tr></table></td></tr></table></td></tr></table></td></tr></table></td></tr></table></div></body></html>\n'
                };

                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });


                return   res.status(200).send({
                    status: 1,
                    data:{
                        user:user.username,
                        message:product.plan+" Was Successfully Delivered To "+req.body.number,
                        server_res:response.body
                    }

                });
            } else if (data.success===0) {

              return   res.status(200).send({
                    status: 0,
                    message: data.message
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
exports.buydatgeneral =  async (req, res) => {
    const userid = req.body.userId;

    var boy;
    try {

        if(req.body.number===""){
            return res.status(200).send({status: 0, message: "Kindly enter your phone number."});

        }
        if(req.body.id===""){
            return res.status(200).send({status: 0, message: "Kindly select your network."});

        }
        let authorities = [];

        const user = await User.findOne({
            where: {
                id: userid,
            },
        });

        if (!user) {
            // req.session = null;
            return res.status(200).send({status: 0, message: "Kindly login your account."});
        }

        if (user.point !== 2){

            return res.status(200).send({status: 0, message: "You don't have up to 2 coin in your account"});

        }

        const product= await datanew.findOne({
            where:{
                id:req.body.id,
            },
        });
        if(!product){
            return res.status(200).send({
                status:0,
                message:"product not Found"
            });
        }
        const gm= await gateway.findOne({
            where:{
                id:1,
            },
        });
        const amount=product.tamount;
const o=User.wallet < product.tamount;
        if (parseInt(gm.tamount) < parseInt(product.tamount))
        {
           return  res.status(200).send({
                status:"0",
               mu:o,
               se:product.tamount,
               balance:user.wallet,
                message:"insufficient general market balance"
            });
        }

        const totalbill= await bill.findOne({
            where:{
                refid:req.body.refid,
            },
        });
        if (totalbill)
        {
            return res.status(200).send({
                status: "0",
                message: "duplicate transaction"
            });
        }
        if (req.body.amount < 0)
        {
            return res.status(200).send({
                status: "0",
                message: "invalid transaction"
            });
        }




        const gbonus= parseInt(gm.amount) + parseInt(gm.tamount);
        var tamount=parseInt(gm.tamount) - parseInt(amount);

        const user1 = await gateway.update(
            { tamount: tamount });

        const bil= await bill.create({
            username:user.username,
            plan:product.plan,
            amount:product.tamount,
            server_res:"data",
        result:"0",
        phone:req.body.number,
        refid:req.body.refid,

        });


        var options = {
            'method': 'POST',
            'url': 'https://reseller.mcd.5starcompany.com.ng/api/v1/data',
            'headers': {
                'Authorization': 'Bearer ChBfBAKZXxBhVDM6Vta54LAjNHcpNSzAhUcgmxr274wUetwtgGbbOJ1Uv0HoQckSLK8o9VIs1YlUUzP6ONe7rpXY2W7hg2YlYxcO7fJOP8uUPe3SG8hVKUwbrkkgmX4piw2yipJbY6R1tK5MyIFZYn',
                'Content-Type': 'application/json'
            },
            formData: {
                'payment': 'wallet',
                'coded': product.plan_id,
                'number': req.body.number,
                'ref':req.body.refid,
                'country':'NG',
                'promo':'0'
            }
        };

        request(options, function (error, response) {
            if (error) console.log(error);
            var data=JSON.parse(response.body);
            console.log(data.message);
            if (data.success===1){
                console.log(data);

                const objectToUpdate = {
                    result:1,
                    server_res:response.body

                }

                bill.findAll({ where: { id: bil.id}}).then((result) => {
                    if(result){
                        result[0].set(objectToUpdate);
                        result[0].save();
                    }
                })



                const update={
                    tamount:gbonus,
                }

                gateway.findAll({where:{ id:1,}}).then((result)=>{
                    if (result){
                        result[0].set(update);
                        result[0].save();
                    }
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
                    to:'info@savebills.com.ng,'+ user.email,
                    subject: user.username+' Transaction',
                    html: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="font-family:arial, \'helvetica neue\', helvetica, sans-serif"><head><meta charset="UTF-8"><meta content="width=device-width, initial-scale=1" name="viewport"><meta name="x-apple-disable-message-reformatting"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta content="telephone=no" name="format-detection"><title>New Template 2</title><!--[if (mso 16)]><style type="text/css">     a {text-decoration: none;}     </style><![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]><xml> <o:OfficeDocumentSettings> <o:AllowPNG></o:AllowPNG> <o:PixelsPerInch>96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml><![endif]--><!--[if !mso]><!-- --><link href="https://fonts.googleapis.com/css?family=Merriweather:400,400i,700,700i" rel="stylesheet"><link href="https://fonts.googleapis.com/css?family=Merriweather+Sans:400,400i,700,700i" rel="stylesheet"><!--<![endif]--><style type="text/css">#outlook a {\tpadding:0;}.es-button {\tmso-style-priority:100!important;\ttext-decoration:none!important;}a[x-apple-data-detectors] {\tcolor:inherit!important;\ttext-decoration:none!important;\tfont-size:inherit!important;\tfont-family:inherit!important;\tfont-weight:inherit!important;\tline-height:inherit!important;}.es-desk-hidden {\tdisplay:none;\tfloat:left;\toverflow:hidden;\twidth:0;\tmax-height:0;\tline-height:0;\tmso-hide:all;}[data-ogsb] .es-button {\tborder-width:0!important;\tpadding:10px 30px 10px 30px!important;}@media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120%!important } h1 { font-size:36px!important; text-align:left } h2 { font-size:26px!important; text-align:left } h3 { font-size:20px!important; text-align:left } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:36px!important; text-align:left } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:26px!important; text-align:left } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important; text-align:left } .es-menu td a { font-size:12px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:14px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:14px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:inline-block!important } a.es-button, button.es-button { font-size:20px!important; display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0!important } .es-m-p0r { padding-right:0!important } .es-m-p0l { padding-left:0!important } .es-m-p0t { padding-top:0!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-m-p5 { padding:5px!important } .es-m-p5t { padding-top:5px!important } .es-m-p5b { padding-bottom:5px!important } .es-m-p5r { padding-right:5px!important } .es-m-p5l { padding-left:5px!important } .es-m-p10 { padding:10px!important } .es-m-p10t { padding-top:10px!important } .es-m-p10b { padding-bottom:10px!important } .es-m-p10r { padding-right:10px!important } .es-m-p10l { padding-left:10px!important } .es-m-p15 { padding:15px!important } .es-m-p15t { padding-top:15px!important } .es-m-p15b { padding-bottom:15px!important } .es-m-p15r { padding-right:15px!important } .es-m-p15l { padding-left:15px!important } .es-m-p20 { padding:20px!important } .es-m-p20t { padding-top:20px!important } .es-m-p20r { padding-right:20px!important } .es-m-p20l { padding-left:20px!important } .es-m-p25 { padding:25px!important } .es-m-p25t { padding-top:25px!important } .es-m-p25b { padding-bottom:25px!important } .es-m-p25r { padding-right:25px!important } .es-m-p25l { padding-left:25px!important } .es-m-p30 { padding:30px!important } .es-m-p30t { padding-top:30px!important } .es-m-p30b { padding-bottom:30px!important } .es-m-p30r { padding-right:30px!important } .es-m-p30l { padding-left:30px!important } .es-m-p35 { padding:35px!important } .es-m-p35t { padding-top:35px!important } .es-m-p35b { padding-bottom:35px!important } .es-m-p35r { padding-right:35px!important } .es-m-p35l { padding-left:35px!important } .es-m-p40 { padding:40px!important } .es-m-p40t { padding-top:40px!important } .es-m-p40b { padding-bottom:40px!important } .es-m-p40r { padding-right:40px!important } .es-m-p40l { padding-left:40px!important } .es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; max-height:inherit!important } }</style></head>\n' +
                        '<body style="width:100%;font-family:arial, \'helvetica neue\', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0"><div class="es-wrapper-color" style="background-color:#FAFAFA"><!--[if gte mso 9]><v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t"> <v:fill type="tile" color="#fafafa"></v:fill> </v:background><![endif]--><table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#FAFAFA"><tr><td valign="top" style="padding:0;Margin:0"><table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%"><tr><td align="center" style="padding:0;Margin:0"><table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px"><tr><td align="left" style="padding:0;Margin:0;padding-top:15px;padding-left:20px;padding-right:20px"><table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td align="center" valign="top" style="padding:0;Margin:0;width:560px"><table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td align="center" style="padding:0;Margin:0;padding-top:10px;padding-bottom:10px;font-size:0px"><img src="https://lgftzw.stripocdn.email/content/guids/CABINET_05246376297d4f2be005783076e6e0ac/images/lg.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="100" height="95"></td>\n' +
                        '</tr><tr><td align="center" class="es-m-txt-c" style="padding:0;Margin:0;padding-bottom:10px"><h1 style="Margin:0;line-height:46px;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;font-size:46px;font-style:normal;font-weight:bold;color:#333333"><strong>Transaction Record</strong></h1></td></tr></table></td></tr></table></td></tr></table></td>\n' +
                        '</tr></table><table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%"><tr><td align="center" style="padding:0;Margin:0"><table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px"><tr><td align="left" style="padding:20px;Margin:0"><table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td align="center" valign="top" style="padding:0;Margin:0;width:560px"><table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td align="center" class="es-m-txt-c" style="padding:0;Margin:0"><h2 style="Margin:0;line-height:31px;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;font-size:26px;font-style:normal;font-weight:bold;color:#333333">Refid&nbsp;<a target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#3d85c6;font-size:26px" href="">' + req.body.refid+'</a>&nbsp;has been recorded!&nbsp;</h2>\n' +
                        '</td></tr><tr><td align="center" style="padding:0;Margin:0;padding-bottom:15px;padding-top:25px"><span class="es-button-border" style="border-style:solid;border-color:#3d85c6;background:#6fa8dc;border-width:2px;display:inline-block;border-radius:6px;width:auto"><a href="" class="es-button" target="_blank" style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;color:#FFFFFF;font-size:20px;border-style:solid;border-color:#6fa8dc;border-width:10px 30px 10px 30px;display:inline-block;background:#6fa8dc;border-radius:6px;font-family:arial, \'helvetica neue\', helvetica, sans-serif;font-weight:normal;font-style:normal;line-height:24px;width:auto;text-align:center;border-left-width:30px;border-right-width:30px">' + user.name+'</a></span></td>\n' +
                        '</tr><tr><td align="center" style="padding:0;Margin:0;padding-bottom:20px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px"><strong>DATE:&nbsp;</strong>&nbsp;<strong>' + new Date()+'</strong></p></td></tr></table></td></tr></table></td>\n' +
                        '</tr><tr><td align="left" style="padding:0;Margin:0;padding-top:10px;padding-left:20px;padding-right:20px"><table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td class="es-m-p0r" align="center" style="padding:0;Margin:0;width:560px"><table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;border-top:2px solid #efefef;border-bottom:2px solid #efefef" role="presentation"><tr><td align="left" style="padding:0;Margin:0"><ul><li style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;Margin-bottom:15px;margin-left:0;color:#333333;font-size:14px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:\'merriweather sans\', \'helvetica neue\', helvetica, arial, sans-serif;line-height:21px;color:#333333;font-size:14px"><strong>Product:' + product.plan+'</strong></p>\n' +
                        '</li><li style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;Margin-bottom:15px;margin-left:0;color:#333333;font-size:14px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:\'merriweather sans\', \'helvetica neue\', helvetica, arial, sans-serif;line-height:21px;color:#333333;font-size:14px"><strong>Amount: NGN' + product.tamount+'</strong></p></li>\n' +
                        '<li style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;Margin-bottom:15px;margin-left:0;color:#333333;font-size:14px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:\'merriweather sans\', \'helvetica neue\', helvetica, arial, sans-serif;line-height:21px;color:#333333;font-size:14px"><strong>Refid: ' + req.body.refid+'</strong></p></li>\n' +
                        '<li style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;Margin-bottom:15px;margin-left:0;color:#333333;font-size:14px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:\'merriweather sans\', \'helvetica neue\', helvetica, arial, sans-serif;line-height:21px;color:#333333;font-size:14px"><strong>Phone Number; ' + req.body.number+'</strong></p></li>\n' +
                        '<li style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;Margin-bottom:15px;margin-left:0;color:#333333;font-size:14px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:\'merriweather sans\', \'helvetica neue\', helvetica, arial, sans-serif;line-height:21px;color:#333333;font-size:14px"><strong>Balance: NGN' + tamount+'</strong></p></li>\n' +
                        '<li style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;Margin-bottom:15px;margin-left:0;color:#333333;font-size:14px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:\'merriweather sans\', \'helvetica neue\', helvetica, arial, sans-serif;line-height:21px;color:#333333;font-size:14px"><strong>Date: ' + new Date()+'</strong></p></li></ul></td></tr></table></td></tr></table></td>\n' +
                        '</tr><tr><td align="left" style="Margin:0;padding-bottom:10px;padding-top:15px;padding-left:20px;padding-right:20px"><table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td align="left" style="padding:0;Margin:0;width:560px"><table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td align="center" style="padding:0;Margin:0;padding-top:10px;padding-bottom:10px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px">If you have any questions/issues, please contact us at&nbsp;<a href="mailto:info@savebills.com.ng" target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#5C68E2;font-size:14px">info@savebills.com.ng</a><br>Thanks for choosing us</p>\n' +
                        '</td></tr></table></td></tr></table></td></tr></table></td>\n' +
                        '</tr></table><table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%"><tr><td class="es-info-area" align="center" style="padding:0;Margin:0"><table class="es-content-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px" bgcolor="#FFFFFF"><tr><td align="left" style="padding:20px;Margin:0"><table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td align="center" valign="top" style="padding:0;Margin:0;width:560px"><table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td align="center" class="es-infoblock" style="padding:0;Margin:0;line-height:14px;font-size:12px;color:#CCCCCC"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:14px;color:#CCCCCC;font-size:12px"><a target="_blank" href="" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px"></a>No longer want to receive these emails?&nbsp;<a href="" target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px">Unsubscribe</a>.<a target="_blank" href="" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px"></a></p>\n' +
                        '</td></tr></table></td></tr></table></td></tr></table></td></tr></table></td></tr></table></div></body></html>\n'
                };

                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });


                return   res.status(200).send({
                    status: 1,
                    data:{
                        user:user.username,
                        message:product.plan+" Was Successfully Delivered To "+req.body.number,
                        server_res:response.body
                    }

                });
            } else if (data.success===0) {

              return   res.status(200).send({
                    status: 0,
                    message: data.message
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
exports.buydataATM =  async (req, res) => {
    const userid = req.body.userId;

    try {

        if(req.body.number===""){
            return res.status(200).send({status: 0, message: "Kindly enter your phone number."});

        }
        if(req.body.id===""){
            return res.status(200).send({status: 0, message: "Kindly select your network."});

        }

        if(req.body.refid===""){
            return res.status(200).send({status: "0", message: "Kindly enter your payment refid."});

        }
        if(req.body.payment_ref===""){
            return res.status(200).send({status: "0", message: "Kindly enter your payment refid."});

        }
        const user = await User.findOne({
            where: {
                id: userid,
            },
        });

        if (!user) {
            // req.session = null;
            return res.status(200).send({status: "0", message: "Kindly login your account."});
        }
        const product= await datanew.findOne({
            where:{
                id:req.body.id,
            },
        });
        if(!product){
            return res.status(200).send({
                status:0,
                message:"product not Found"
            });
        }

        const fundrefid= await deposit.findOne({
            where:{
                payment_ref:req.body.refid,
            },
        });

        if (fundrefid)
        {
            return res.status(200).send({
                status: "0",
                message: "duplicate transaction(payment)",
                body:fundrefid
            });
        }

        const totalbill= await bill.findOne({
            where:{
                refid:req.body.refid,
            },
        });
        if (totalbill)
        {
            return res.status(200).send({
                status: "0",
                message: "duplicate transaction(data)"
            });
        }

        const bil= await bill.create({
            username:user.username,
            plan:product.network+''+ product.plan,
            amount:product.tamount,
            server_res:"data",
            result:"0",
            phone:req.body.number,
            refid:req.body.refid,

        });

        const options = {
            method: 'GET',
            url: `https://api-d.squadco.com/transaction/verify/${req.body.payment_ref}`,
            headers: {
                Authorization: 'Bearer sk_61de77ec58f5d4494f922d7be279917c3dea3149'
            }
        };

        request(options, function (error, response) {
            if (error) {
                console.error('Error:', error);
                return res.status(200).send({ status: '0', message: 'Request failed' });
            }

            try {
                const data = JSON.parse(response.body);

                if (data.status === 200) {
                    const amount = data.data.transaction_amount / 100;
                    const totalamount = amount - charge.charges;
                    const allamount = parseInt(user.wallet) + totalamount;

                    if (data.data.transaction_status === 'success') {
                        // Create records in the database (assuming "charges" and "deposit" are models)

                        deposit.create({
                            status: '1',
                            username: user.username,
                            payment_ref: req.body.payment_ref, // Assuming you meant req.body.refid here
                            amount: amount,
                            narration: 'Amount funded by Squad',
                            iwallet: user.wallet,
                            fwallet: parseInt(user.wallet) + parseInt(amount)
                        });







                        // Update the user's wallet amount in the database
                        User.update(
                            { wallet: allamount },
                            { where: { id: user.id } }
                        ).then(() => {
                            // Handle the success of the database update if needed
                            return res.status(200).send({
                                status: '1',
                                message: 'Account was successfully fund with NGN'+amount
                            });
                        });
                    } else if (data.data.transaction_status === 'failed') {
                        return res.status(200).send({
                            status: '0',
                            message: data.data
                        });
                    }
                }else {
                    return res.status(200).send({
                        status: '0',
                        message: "Invalid transaction reference"
                    });
                }
            } catch (e) {
                console.error('Error parsing response:', e);
                return res.status(200).send({ status: '0', message: 'Error parsing response' });
            }
        });


        //

    } catch (error) {
        return res.status(201).send({
            message: error.message});
    }


};
