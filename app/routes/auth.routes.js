const { verifySignUp, authJwt} = require("../middleware");
const { encrypt }  = require("../middleware");
const controller = require("../controllers/auth.controller");
const dashboard = require("../controllers/dashboard.controller");
const airtime = require("../controllers/airtime.controller");
const data = require("../controllers/data.controller");
const buydata = require("../controllers/buydata.controller");
const tv = require("../controllers/tv.controller");
const verifytv = require("../controllers/verifytv.controller");
const verifyelect = require("../controllers/verifyelect.controller");
const buytv = require("../controllers/buytv.controller");
const buyelect = require("../controllers/buyelect.controller");
const profile = require("../controllers/profile.controller");
const createlock = require("../controllers/safelock.controller");
const alllock = require("../controllers/lock.controller");
const alldeposit = require("../controllers/deposit.controller");
const addlock = require("../controllers/addlock.controller");
const purchase = require("../controllers/purchase.controller");
const run = require("../controllers/run.controller");
const run1 = require("../controllers/run1.controller");
const interest = require("../controllers/interest.controller");
const bank = require("../controllers/bank.controller");
const verify = require("../controllers/verify.controller");
const withdraw = require("../controllers/withdraw.controller");
const update = require("../controllers/date.controller");
const pass = require("../controllers/pass.controller");
const fund = require("../controllers/fund.controller");
const upgrade = require("../controllers/upgrade.controller");
const changepassword = require("../controllers/changpass.controller");
const listdata= require("../controllers/listdata.controller");
const googl = require("../controllers/google.controller");
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const paylony=require("../controllers/paylony.controller");
const Pin=require("../controllers/pin.controller");
const verifyemail=require("../controllers/verifyemail.controller");
const Fingerprint=require("../controllers/finger.controller");
const Resend =require("../controllers/getotp.controller");
const verifybe=require("../controllers/verifybetting.controller");
const buybet=require("../controllers/buybetting.controller");
const account2=require("../controllers/generateaccountall.controller");
const account3=require("../controllers/generateaccountall1.controller");
const chathistory= require("../controllers/chatapi.controller");
const { validation }  = require("../middleware");
const statistic=require("../controllers/statistic.controller");
const reward=require("../controllers/reward.controller");
const {join} = require("path");
const db = require("../models");
const setting=db.settings ;
const {static} = require("express");
const adminchat=require("../controllers/adminchatapi.controller");
const mailss=require("../controllers/sendmail.controller");
module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signup",
    [
      // verifySignUp.checkDuplicateUsernameOrEmail,
      // verifySignUp.checkRolesExisted,
      encrypt.decryptMiddleware
    ],
    controller.signup
  );
  app.post("/api/auth/chart",[encrypt.decryptMiddleware,validation.usercheck], statistic.statistic);
    app.get("/api/auth/newaccount",[encrypt.decryptMiddleware], account2.generateAccountall);
    app.get("/api/auth/newacc",[encrypt.decryptMiddleware], account3.generateAccountall);
    app.post("/api/auth/newacc1", [encrypt.decryptMiddleware], account3.generateaccountone);
    app.post("/api/auth/newaccount1",[encrypt.decryptMiddleware], account2.generateaccountone);
  app.post("/api/auth/verifybetting", verifybe.verifybetting);
  app.post("/api/auth/buybet", [encrypt.decryptMiddleware], buybet.bet);
  app.post("/api/auth/signin",[encrypt.decryptMiddleware, validation.loginValidation], controller.signin);
  app.post("/api/auth/verifyemail",[encrypt.decryptMiddleware], verifyemail.verifyemail);
  app.get("/api/auth/dashboard",
      // [authJwt.verifyToken],
      dashboard.dashboard);
    app.get("/api/auth/fingerprint",
        [authJwt.verifyToken],

        Fingerprint.finger);
  app.post("/api/auth/otp",[encrypt.decryptMiddleware], Resend.otp);
  app.post("/api/auth/createpin", [encrypt.decryptMiddleware], Pin.createpin);
  app.post("/api/auth/changepin",[encrypt.decryptMiddleware], Pin.changepin);
  app.get("/listdata", listdata.listdata);
  app.post("/listtv", listdata.listtv);
  app.post("/listdatapin",[encrypt.decryptMiddleware], listdata.listdatapin);
  app.post("/api/auth/reward",[encrypt.decryptMiddleware, validation.reward], reward.reward);
  app.post("/api/auth/airtime",[encrypt.decryptMiddleware, validation.airtimeValidation], airtime.airtimenewencry);
  app.post("/api/auth/airtimepin",[encrypt.decryptMiddleware, validation.airtimepin], airtime.airtimepin);
  app.post("/api/auth/buydatanew",[encrypt.decryptMiddleware, validation.dataValidation], buydata.buydatanewencry);
  // app.post("/api/auth/buydatanew", buydata.buydatanew);
  // app.post("/api/auth/buydatageneral",[encrypt.decryptMiddleware, validation.dataValidation], buydata.buydatageneral);
  app.post("/api/auth/tv",[encrypt.decryptMiddleware], tv.tv);
  app.post("/api/auth/verifytv",[encrypt.decryptMiddleware], verifytv.verifytv);
  app.post("/api/auth/verifyelect",[encrypt.decryptMiddleware], verifyelect.verifyelect);
  app.post("/api/auth/buytv",[encrypt.decryptMiddleware], buytv.buytv);
  app.post("/api/auth/buyelect1", [encrypt.decryptMiddleware], buyelect.buyelect);
  app.post("/api/auth/profile",[encrypt.decryptMiddleware], profile.profile);
  app.post("/api/auth/run", run.run);
  app.post("/api/auth/run1", run1.run1);
  app.post("/api/auth/paylony", paylony.paylony);
  app.post("/api/auth/addlock",[encrypt.decryptMiddleware], addlock.add);
  app.get("/api/auth/in", interest.add);
  app.get("/api/auth/update", update.add);
  app.get("/api/auth/bank", bank.bank);
  app.post("/api/auth/verify",[encrypt.decryptMiddleware], verify.bank);
  app.post("/api/auth/cpass",[encrypt.decryptMiddleware], changepassword.cpass);
  app.post("/api/auth/pass",[encrypt.decryptMiddleware], pass.password);
  app.post("/api/auth/fund",[encrypt.decryptMiddleware], fund.fund);
  app.get("/api/auth/fundtest", fund.initiatefund);
  app.get("/api/auth/checking", fund.checking);
  app.post("/api/auth/verifyfund",[encrypt.decryptMiddleware], fund.fundverify);
  // app.post("/api/auth/verifytest", fund.fundverifytest);
  app.post("/api/auth/upgrade",[encrypt.decryptMiddleware], upgrade.upgrade);
  app.post("/api/auth/google",[encrypt.decryptMiddleware], googl.google);

      app.post("/api/auth/data",[encrypt.decryptMiddleware], data.data);
      app.post("/api/auth/datanew",[encrypt.decryptMiddleware], data.datanew);
      app.post("/api/auth/singledata",[encrypt.decryptMiddleware], data.getSingledata);
      app.post("/api/auth/createlock", [encrypt.decryptMiddleware], createlock.safelock);
      app.get("/api/auth/allock",
          [authJwt.verifyToken],
          alllock.allock);
 app.get("/api/auth/purchase",
          [authJwt.verifyToken],
          purchase.purchase);
 app.post("/api/auth/with",[encrypt.decryptMiddleware],
         withdraw.bank);
 app.get("/api/auth/alldeposit",
          [authJwt.verifyToken],
          alldeposit.alldeposit);

  app.post("/api/auth/signout",[encrypt.decryptMiddleware], controller.signout);
  app.post("/api/auth/delete",[encrypt.decryptMiddleware], controller.delete);

  app.post("/api/auth/chathistory",[encrypt.decryptMiddleware], chathistory.chatapi);
  app.get("/api/auth/adminchat", adminchat.adminchatapi);
  app.get("/api/auth/sendsmail", mailss.updatemail);
  app.get("/api/auth/sendsreward", mailss.rewardmail);
  app.get("/api/auth/sendsgeneral", mailss.generalmarketmail);
    app.use(static(join(__dirname, 'public')));

    app.get('/getfund', async (req, res) => {
        try {
            // Fetch data from the database using Sequelize
            const pay = await setting.findOne({ where: { id: 1 } });

            if (!pay || pay.squadco !== 1) {
                res.sendFile(join(__dirname, 'public', 'index1.html'));
            } else {
                res.sendFile(join(__dirname, 'public', 'index.html'));
            }

        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    });
};
