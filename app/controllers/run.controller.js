    const db = require("../models");
    const nodemailer = require("nodemailer");
    const User = db.user;
    const bill= db.bill;
    const deposit=db.deposit;
    const settings=db.settings;
    const web = db.web;
    const charges=db.charges;
    exports.run =  async (req, res) => {
        var data=req.body;

        const ino=await web.create({
            webbook:data,
        });

        const account = data.account_number;
        const refid = data.ref;
        const amount = data.amount;
        try {
            const user = await User.findOne({ where: { account_number: account } });


            if (!user) {
                // req.session = null;
                return res.status(200).send({status: "0", message: "Kindly login your account."});
            }
            const deposite =await deposit.findOne({
                where:{
                    payment_ref	:refid,
                },
            });
            if (deposite) {

                return res.status(200).send({
                    status: "0",
                    message: "duplicate transaction",
                    body:deposite
                });
            }
            const charge =await settings.findOne({
                where:{
                    id:1,
                },
            });

            const totalamount=amount-charge.charges;

            const allamount=parseInt(user.wallet)+totalamount;


            const insertcharges =await charges.create({
                username:user.username,
                payment_ref:refid,
                amount:charge.charges,
                iwallet:user.wallet,
                fwallet:parseInt(user.wallet)+amount,
                status:1,
            });

            const insertdeposit=await deposit.create({
                status:1,
                username:user.username,
                payment_ref:refid,
                amount:amount,
                iwallet:user.wallet,
                fwallet:parseInt(user.wallet)+amount,
            })



            const objectToUpdate = {
                wallet:allamount,
            }

            User.findAll({ where: { id: user.id}}).then((result) => {
                if(result){
                    result[0].set(objectToUpdate);
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
                subject: user.username+' Account Funded',
                html: '<body style=\'width:100%;font-family:arial, helvetica neue, helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0\'>\n' +
                    '<div class=\'es-wrapper-color\' style=\'background-color:#FAFAFA\'>\n' +
                    '    <!--[if gte mso 9]>\n' +
                    '    <v:background xmlns:v=\'urn:schemas-microsoft-com:vml\' fill=\'t\'>\n' +
                    '        <v:fill type=\'tile\' color=\'#fafafa\'></v:fill>\n' +
                    '    </v:background>\n' +
                    '    <![endif]-->\n' +
                    '    <table class=\'es-wrapper\' width=\'100%\' cellspacing=\'0\' cellpadding=\'0\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#FAFAFA\'>\n' +
                    '        <tr>\n' +
                    '            <td valign=\'top\' style=\'padding:0;Margin:0\'>\n' +
                    '                <table cellpadding=\'0\' cellspacing=\'0\' class=\'es-content\' align=\'center\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%\'>\n' +
                    '                    <tr>\n' +
                    '                        <td class=\'es-info-area\' align=\'center\' style=\'padding:0;Margin:0\'>\n' +
                    '                            <table class=\'es-content-body\' align=\'center\' cellpadding=\'0\' cellspacing=\'0\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px\' bgcolor=\'#FFFFFF\'>\n' +
                    '                                <tr>\n' +
                    '                                    <td align=\'left\' style=\'padding:20px;Margin:0\'>\n' +
                    '                                        <table cellpadding=\'0\' cellspacing=\'0\' width=\'100%\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px\'>\n' +
                    '                                            <tr>\n' +
                    '                                                <td align=\'center\' valign=\'top\' style=\'padding:0;Margin:0;width:560px\'>\n' +
                    '                                                    <table cellpadding=\'0\' cellspacing=\'0\' width=\'100%\' role=\'presentation\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px\'>\n' +
                    '                                                        <tr>\n' +
                    '                                                            <td align=\'center\' class=\'es-infoblock\' style=\'padding:0;Margin:0;line-height:14px;font-size:12px;color:#CCCCCC\'><p style=\'Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, helvetica neue, helvetica, sans-serif;line-height:14px;color:#CCCCCC;font-size:12px\'><a target=\'_blank\' href=\'\' style=\'-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px\'></a></p></td>\n' +
                    '                                                        </tr>\n' +
                    '                                                    </table></td>\n' +
                    '                                            </tr>\n' +
                    '                                        </table></td>\n' +
                    '                                </tr>\n' +
                    '                            </table></td>\n' +
                    '                    </tr>\n' +
                    '                </table>\n' +
                    '                <table cellpadding=\'0\' cellspacing=\'0\' class=\'es-header\' align=\'center\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top\'>\n' +
                    '                    <tr>\n' +
                    '                        <td align=\'center\' style=\'padding:0;Margin:0\'>\n' +
                    '                            <table bgcolor=\'#ffffff\' class=\'es-header-body\' align=\'center\' cellpadding=\'0\' cellspacing=\'0\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px\'>\n' +
                    '                                <tr>\n' +
                    '                                    <td align=\'left\' style=\'padding:20px;Margin:0\'>\n' +
                    '                                        <table cellpadding=\'0\' cellspacing=\'0\' width=\'100%\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px\'>\n' +
                    '                                            <tr>\n' +
                    '                                                <td class=\'es-m-p0r\' valign=\'top\' align=\'center\' style=\'padding:0;Margin:0;width:560px\'>\n' +
                    '                                                    <table cellpadding=\'0\' cellspacing=\'0\' width=\'100%\' role=\'presentation\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px\'>\n' +
                    '                                                        <tr>\n' +
                    '                                                            <td align=\'center\' style=\'padding:0;Margin:0;padding-bottom:10px;font-size:10px\'><img src=\'https://primedata.com.ng/lg.png\' alt=\'Logo\' style=\'display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;font-size:12px\' width=\'200\' title=\'Logo\'></td>\n' +
                    '                                                        </tr>\n' +
                    '                                                    </table></td>\n' +
                    '                                            </tr>\n' +
                    '                                        </table></td>\n' +
                    '                                </tr>\n' +
                    '                            </table></td>\n' +
                    '                    </tr>\n' +
                    '                </table>\n' +
                    '                <table cellpadding=\'0\' cellspacing=\'0\' class=\'es-content\' align=\'center\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%\'>\n' +
                    '\n' +
                    '                    <tr>\n' +
                    '                        <td align=\'center\' style=\'padding:0;Margin:0\'>\n' +
                    '                            <table bgcolor=\'#ffffff\' class=\'es-content-body\' align=\'center\' cellpadding=\'0\' cellspacing=\'0\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px\'>\n' +
                    '                                <tr>\n' +
                    '                                    <td align=\'left\' style=\'padding:0;Margin:0;padding-top:15px;padding-left:20px;padding-right:20px\'>\n' +
                    '                                        <table cellpadding=\'0\' cellspacing=\'0\' width=\'100%\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px\'>\n' +
                    '                                            <tr>\n' +
                    '                                                <td align=\'center\' valign=\'top\' style=\'padding:0;Margin:0;width:560px\'>\n' +
                    '                                                    <table cellpadding=\'0\' cellspacing=\'0\' width=\'100%\' role=\'presentation\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px\'>\n' +
                    '                                                        <tr>\n' +
                    '                                                            <td align=\'center\' style=\'padding:0;Margin:0;padding-top:10px;padding-bottom:10px;font-size:10px\'></td>\n' +
                    '                                                        </tr>\n' +
                    '                                                        <tr>\n' +
                    '                                                            <td align=\'center\' style=\'padding:0;Margin:0;padding-bottom:10px\'><h1 style=\'Margin:0;line-height:46px;mso-line-height-rule:exactly;font-family:arial, helvetica neue, helvetica, sans-serif;font-size:46px;font-style:normal;font-weight:bold;color:#333333\'>Wallet Funded</h1></td>\n' +
                    '                                                        </tr>\n' +
                    '                                                    </table></td>\n' +
                    '                                            </tr>\n' +
                    '                                        </table></td>\n' +
                    '                                </tr>\n' +
                    '                            </table></td>\n' +
                    '                    </tr>\n' +
                    '                </table>\n' +
                    '                <table cellpadding=\'0\' cellspacing=\'0\' class=\'es-content\' align=\'center\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%\'>\n' +
                    '                    <tr>\n' +
                    '                        <td align=\'center\' style=\'padding:0;Margin:0\'>\n' +
                    '                            <table bgcolor=\'#ffffff\' class=\'es-content-body\' align=\'center\' cellpadding=\'0\' cellspacing=\'0\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px\'>\n' +
                    '                                <tr>\n' +
                    '                                    <td align=\'left\' style=\'Margin:0;padding-bottom:10px;padding-top:20px;padding-left:20px;padding-right:20px\'>\n' +
                    '                                        <table cellpadding=\'0\' cellspacing=\'0\' width=\'100%\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px\'>\n' +
                    '                                            <tr>\n' +
                    '                                                <td align=\'center\' valign=\'top\' style=\'padding:0;Margin:0;width:560px\'>\n' +
                    '                                                    <table cellpadding=\'0\' cellspacing=\'0\' width=\'100%\' role=\'presentation\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px\'>\n' +
                    '                                                        <tr>\n' +
                    '                                                            <td align=\'center\' class=\'es-m-p0r es-m-p0l\' style=\'Margin:0;padding-top:5px;padding-bottom:5px;padding-left:40px;padding-right:40px\'><p style=\'Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, helvetica neue, helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px\'>Detail Of Total Amount Funded</p></td>\n' +
                    '                                                        </tr>\n' +
                    '                                                        <tr>\n' +
                    '                                                            <td align=\'center\' style=\'padding:0;Margin:0;padding-top:10px;padding-bottom:10px\'><span class=\'es-button-border\' style=\'border-style:solid;border-color:#283DC7FF;background:#283DC7FF;border-width:0px;display:inline-block;border-radius:5px;width:auto\'><a href=\'\' class=\'es-button\' target=\'_blank\' style=\'mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;color:#FFFFFF;font-size:20px;border-style:solid;border-color:#2b2b2b;border-width:10px 30px 10px 30px;display:inline-block;background:#5C68E2;border-radius:5px;font-family:arial, helvetica neue, helvetica, sans-serif;font-weight:normal;font-style:normal;line-height:24px;width:auto;text-align:center\'>'+user.username+'</a></span></td>\n' +
                    '                                                        </tr>\n' +
                    '                                                    </table></td>\n' +
                    '                                            </tr>\n' +
                    '                                        </table></td>\n' +
                    '                                </tr>\n' +
                    '                                <tr>\n' +
                    '                                    <td align=\'left\' style=\'padding:0;Margin:0;padding-top:10px;padding-left:20px;padding-right:20px\'>\n' +
                    '                                        <table cellpadding=\'0\' cellspacing=\'0\' width=\'100%\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px\'>\n' +
                    '                                            <tr>\n' +
                    '                                                <td class=\'es-m-p0r\' align=\'center\' style=\'padding:0;Margin:0;width:560px\'>\n' +
                    '                                                    <table cellpadding=\'0\' cellspacing=\'0\' width=\'100%\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;border-top:2px solid #efefef;border-bottom:2px solid #efefef\' role=\'presentation\'>\n' +
                    '                                                        <tr>\n' +
                    '                                                            <td align=\'right\' class=\'es-m-txt-r\' style=\'padding:0;Margin:0;padding-top:10px;padding-bottom:20px\'><p style=\'Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, helvetica neue, helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px\'>Amount Fund:&nbsp;<strong>₦'+data.amount+'</strong><br>Early Amount:&nbsp;<strong>₦ '+user.wallet+'</strong><br>Present Balance:&nbsp;<strong>₦'+allamount+'</strong><br>Amount Charge:&nbsp;<strong>₦'+charge.charges+'</strong</p></td>\n' +
                    '                                                        </tr>\n' +
                    '                                                    </table></td>\n' +
                    '                                            </tr>\n' +
                    '                                        </table></td>\n' +
                    '                                </tr>\n' +
                    '                                <tr>\n' +
                    '                                    <td align=\'left\' style=\'Margin:0;padding-bottom:10px;padding-top:15px;padding-left:20px;padding-right:20px\'>\n' +
                    '                                        <table cellpadding=\'0\' cellspacing=\'0\' width=\'100%\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px\'>\n' +
                    '                                            <tr>\n' +
                    '                                                <td align=\'left\' style=\'padding:0;Margin:0;width:560px\'>\n' +
                    '                                                    <table cellpadding=\'0\' cellspacing=\'0\' width=\'100%\' role=\'presentation\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px\'>\n' +
                    '                                                        <tr>\n' +
                    '                                                            <td align=\'center\' style=\'padding:0;Margin:0;padding-top:10px;padding-bottom:10px\'><p style=\'Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, helvetica neue, helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px\'>Got a question?&nbsp;Email us at info@savebills.com.ng&nbsp;or give us a call at <a target=\'_blank\' href=\'\' style=\'-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#313335;font-size:14px\'>0816 693 9205</a>.</p></td>\n' +
                    '                                                        </tr>\n' +
                    '                                                    </table></td>\n' +
                    '                                            </tr>\n' +
                    '                                        </table></td>\n' +
                    '                                </tr>\n' +
                    '                            </table></td>\n' +
                    '                    </tr>\n' +
                    '                </table>\n' +
                    '                <table cellpadding=\'0\' cellspacing=\'0\' class=\'es-footer\' align=\'center\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top\'>\n' +
                    '                    <tr>\n' +
                    '                        <td align=\'center\' style=\'padding:0;Margin:0\'>\n' +
                    '                            <table class=\'es-footer-body\' align=\'center\' cellpadding=\'0\' cellspacing=\'0\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px\'>\n' +
                    '                                <tr>\n' +
                    '                                    <td align=\'left\' style=\'Margin:0;padding-top:20px;padding-bottom:20px;padding-left:20px;padding-right:20px\'>\n' +
                    '                                        <table cellpadding=\'0\' cellspacing=\'0\' width=\'100%\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px\'>\n' +
                    '                                            <tr>\n' +
                    '                                                <td align=\'left\' style=\'padding:0;Margin:0;width:560px\'>\n' +
                    '                                                    <table cellpadding=\'0\' cellspacing=\'0\' width=\'100%\' role=\'presentation\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px\'>\n' +
                    '                                                        <tr>\n' +
                    '                                                            <td align=\'center\' style=\'padding:0;Margin:0;padding-top:15px;padding-bottom:15px;font-size:0\'>\n' +
                    '                                                                <table cellpadding=\'0\' cellspacing=\'0\' class=\'es-table-not-adapt es-social\' role=\'presentation\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px\'>\n' +
                    '                                                                    <tr>\n' +
                    '                                                                        <td align=\'center\' valign=\'top\' style=\'padding:0;Margin:0;padding-right:40px\'><img title=\'Facebook\' src=\'https://lgftzw.stripocdn.email/content/assets/img/social-icons/logo-black/facebook-logo-black.png\' alt=\'Fb\' width=\'32\' style=\'display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic\'></td>\n' +
                    '                                                                        <td align=\'center\' valign=\'top\' style=\'padding:0;Margin:0;padding-right:40px\'><img title=\'Twitter\' src=\'https://lgftzw.stripocdn.email/content/assets/img/social-icons/logo-black/twitter-logo-black.png\' alt=\'Tw\' width=\'32\' style=\'display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic\'></td>\n' +
                    '                                                                        <td align=\'center\' valign=\'top\' style=\'padding:0;Margin:0;padding-right:40px\'><img title=\'Instagram\' src=\'https://lgftzw.stripocdn.email/content/assets/img/social-icons/logo-black/instagram-logo-black.png\' alt=\'Inst\' width=\'32\' style=\'display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic\'></td>\n' +
                    '                                                                        <td align=\'center\' valign=\'top\' style=\'padding:0;Margin:0\'><img title=\'Youtube\' src=\'https://lgftzw.stripocdn.email/content/assets/img/social-icons/logo-black/youtube-logo-black.png\' alt=\'Yt\' width=\'32\' style=\'display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic\'></td>\n' +
                    '                                                                    </tr>\n' +
                    '                                                                </table></td>\n' +
                    '                                                        </tr>\n' +
                    '                                                        <tr>\n' +
                    '                                                            <td align=\'center\' style=\'padding:0;Margin:0;padding-bottom:35px\'><p style=\'Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, helvetica neue, helvetica, sans-serif;line-height:18px;color:#333333;font-size:12px\'>© 2021 Savebills Inc. All Rights Reserved.</p><p style=\'Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, helvetica neue, helvetica, sans-serif;line-height:18px;color:#333333;font-size:12px\'><br></p></td>\n' +
                    '                                                        </tr>\n' +
                    '                                                        <tr>\n' +
                    '                                                            <td style=\'padding:0;Margin:0\'>\n' +
                    '                                                                <table cellpadding=\'0\' cellspacing=\'0\' width=\'100%\' class=\'es-menu\' role=\'presentation\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px\'>\n' +
                    '                                                                    <tr class=\'links\'>\n' +
                    '                                                                        <td align=\'center\' valign=\'top\' width=\'33.33%\' style=\'Margin:0;padding-left:5px;padding-right:5px;padding-top:5px;padding-bottom:5px;border:0\'><a target=\'_blank\' href=\'\' style=\'-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:none;display:block;font-family:arial, helvetica neue, helvetica, sans-serif;color:#333333;font-size:12px\'>Visit Us </a></td>\n' +
                    '                                                                        <td align=\'center\' valign=\'top\' width=\'33.33%\' style=\'Margin:0;padding-left:5px;padding-right:5px;padding-top:5px;padding-bottom:5px;border:0;border-left:1px solid #cccccc\'><a target=\'_blank\' href=\'\' style=\'-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:none;display:block;font-family:arial, helvetica neue, helvetica, sans-serif;color:#333333;font-size:12px\'>Privacy Policy</a></td>\n' +
                    '                                                                        <td align=\'center\' valign=\'top\' width=\'33.33%\' style=\'Margin:0;padding-left:5px;padding-right:5px;padding-top:5px;padding-bottom:5px;border:0;border-left:1px solid #cccccc\'><a target=\'_blank\' href=\'\' style=\'-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:none;display:block;font-family:arial, helvetica neue, helvetica, sans-serif;color:#333333;font-size:12px\'>Terms of Use</a></td>\n' +
                    '                                                                    </tr>\n' +
                    '                                                                </table></td>\n' +
                    '                                                        </tr>\n' +
                    '                                                    </table></td>\n' +
                    '                                            </tr>\n' +
                    '                                        </table></td>\n' +
                    '                                </tr>\n' +
                    '                            </table></td>\n' +
                    '                    </tr>\n' +
                    '                </table>\n' +
                    '                <table cellpadding=\'0\' cellspacing=\'0\' class=\'es-content\' align=\'center\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%\'>\n' +
                    '                    <tr>\n' +
                    '                        <td class=\'es-info-area\' align=\'center\' style=\'padding:0;Margin:0\'>\n' +
                    '                            <table class=\'es-content-body\' align=\'center\' cellpadding=\'0\' cellspacing=\'0\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px\' bgcolor=\'#FFFFFF\'>\n' +
                    '                                <tr>\n' +
                    '                                    <td align=\'left\' style=\'padding:20px;Margin:0\'>\n' +
                    '                                        <table cellpadding=\'0\' cellspacing=\'0\' width=\'100%\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px\'>\n' +
                    '                                            <tr>\n' +
                    '                                                <td align=\'center\' valign=\'top\' style=\'padding:0;Margin:0;width:560px\'>\n' +
                    '                                                    <table cellpadding=\'0\' cellspacing=\'0\' width=\'100%\' role=\'presentation\' style=\'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px\'>\n' +
                    '                                                        <tr>\n' +
                    '                                                            <td align=\'center\' class=\'es-infoblock\' style=\'padding:0;Margin:0;line-height:14px;font-size:12px;color:#CCCCCC\'><p style=\'Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, helvetica neue, helvetica, sans-serif;line-height:14px;color:#CCCCCC;font-size:12px\'><a target=\'_blank\' href=\'\' style=\'-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px\'></a>No longer want to receive these emails?&nbsp;<a href=\'\' target=\'_blank\' style=\'-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px\'>Unsubscribe</a>.<a target=\'_blank\' href=\'\' style=\'-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px\'></a></p></td>\n' +
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
                    '</body>'
            };

            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
            return res.status(200).send({message: 'Account Funded', body:user});


        } catch (error) {
            return res.status(500).send({message: error.message});
        }

        res.status(200).send("User Content.");

    };
