const db = require("../models");
const User = db.user;
const deposit=db.deposit;
var request = require('request');
const settings=db.settings;
const charges=db.settings;
const { Worker, isMainThread, parentPort } = require('worker_threads');

exports.fund =  async (req, res) => {
    const decryptedData = req.decryptedData;

    const userid = req.body.userId;

    try {

        const user = await User.findOne({
            where: {
                id: userid,
            },
        });

        if (!user) {
            // req.session = null;
            return res.status(200).send({status: "0", message: "Kindly login your account."});
        }

        if (req.body.amount < 0)
        {
            return res.status(200).send({
                status: "0",
                message: "invalid transaction"
            });
        }




        var options = {
            'method': 'POST',
            'url': 'https://api.budpay.com/api/v2/transaction/initialize',
            'headers': {
                'Authorization': 'Bearer sk_test_f5n6aovwjbqjo6ipwffwjjhg0btgwqge43fg8vm'
            },
            formData: {
                'email': user.email,
                'amount': req.body.amount,
                'callback': 'youcallbackurl'
            }
        };
        request(options, function (error, response) {
            if (error) throw new Error(error);
            var data=JSON.parse(response.body);
            // console.log(data.success);
            // if (data.status=="true"){
                // console.log(data);

                return   res.status(200).send({
                    status: 1,
                    data:data.data,
                    url:data.data.authorization_url,
                });
            // }
            // res.status(200).send(response.body);

        });

        //

    } catch (error) {
        return res.status(201).send({
            message: error.message});
    }


};

exports.fundverify =  async (req, res) => {
    const userid = req.body.userId;

    try {
        if(req.body.refid===""){
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

        const fundrefid= await deposit.findOne({
            where:{
                payment_ref:req.body.refid,
            },
        });

        if (fundrefid)
        {
            return res.status(200).send({
                status: "0",
                message: "duplicate transaction",
                body:fundrefid
            });
        }
        const charge =await settings.findOne({
            where:{
                id:1,
            },
        });



        const options = {
            method: 'GET',
            url: `https://api-d.squadco.com/transaction/verify/${req.body.refid}`,
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
                        charges.create({
                            username: user.username,
                            payment_ref: req.body.refid,
                            amount: charge.charges,
                            iwallet: user.wallet,
                            fwallet: parseInt(user.wallet) + amount,
                            status: '1'
                        });

                        deposit.create({
                            status: '1',
                            username: user.username,
                            payment_ref: req.body.refid, // Assuming you meant req.body.refid here
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
exports.fundverifytest =  async (req, res) => {
    const userid = req.body.userId;

    try {
        if(req.body.refid===""){
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

        const fundrefid= await deposit.findOne({
            where:{
                payment_ref:req.body.refid,
            },
        });

        if (fundrefid)
        {
            return res.status(200).send({
                status: "0",
                message: "duplicate transaction",
                body:fundrefid
            });
        }
        const charge =await settings.findOne({
            where:{
                id:1,
            },
        });



        const options = {
            method: 'GET',
            url: `https://sandbox-api-d.squadco.com/transaction/verify/${req.body.refid}`,
            headers: {
                Authorization: 'Bearer sandbox_sk_1e60156e0e029ec62daa87e91f5a3b0f1a0923246bec'
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
                        charges.create({
                            username: user.username,
                            payment_ref: req.body.refid,
                            amount: charge.charges,
                            iwallet: user.wallet,
                            fwallet: parseInt(user.wallet) + amount,
                            status: '1'
                        });

                        deposit.create({
                            status: '1',
                            username: user.username,
                            payment_ref: req.body.refid, // Assuming you meant req.body.refid here
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
exports.initiatefund = async (req, res) =>{
    const {amount, email, refid} =req.query;
 console.log('akinnnnnnnnnnnnnnnnnnnnnnnnnnnn');
 console.log(req.query);
 console.log(amount);
 console.log(email);
 console.log(refid);

    const options = {
        method: 'POST',
        // url: `https://api-d.squadco.com/transaction/initiate`,
        url: `https://sandbox-api-d.squadco.com/transaction/initiate`,
        headers: {
            'Authorization': 'sandbox_sk_1e60156e0e029ec62daa87e91f5a3b0f1a0923246bec',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount: amount * 100,
            email: email,
            currency: "NGN",
            initiate_type: "inline",
            transaction_ref: refid,
            callback_url: "https://server.savebills.com.ng/api/auth/checking"
        })
    };

    request(options, function (error, response) {
        if (error) console.log(error);
        var data = JSON.parse(response.body);
        console.log('sammmmmmmmmmmmm');
        console.log(data);
        if (data.status === 200) {
            const checkout = data.data.checkout_url;
            // window.location.href=checkout;
            // if (typeof window !== 'undefined') {
            res.send({ checkout_url: checkout });
            // } else {
            //     console.log('Redirect URL:', checkout);
            // }
        }
    })
}

function sendMessageToFlutter(eventType, message) {
    const messageData = {
        event: eventType,
        message: message
    };

    // Post the message
    if (isMainThread) {
        console.error('This function should be called from within a worker thread.');
    } else {
        parentPort.postMessage(messageData);
    }
}

// Example usage
exports.checking = async (req, res) =>{
    const {reference} =req.query;
 console.log('akinnnnnnnnnnnnnnnnnnnnnnnnnnnn');
 console.log(req.query);

    sendMessageToFlutter("verified", reference);

    // window.web2app.biometric.saveauth({'status':0, 'reference':reference});

}
