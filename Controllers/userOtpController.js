var express = require("express");
var router = express.Router();
var productHelpers = require("../helpers/productHelpers");
var userHelpers = require("../helpers/userHelpers");
const paypal = require("paypal-rest-sdk");

require("dotenv").config();

paypal.configure({
   mode: "sandbox", //sandbox or live
   client_id: process.env.Paypal_client_id,
   client_secret: process.env.Paypal_client_secret,
});

YOUR_ACCOUNT_SID = process.env.TWILIO_YOUR_ACCOUNT_SID;
YOUR_AUTH_TOKEN = process.env.TWILIO_YOUR_AUTH_TOKEN;
SERVICE_SID = process.env.TWILIO_SERVICE_SID;

const client = require("twilio")(YOUR_ACCOUNT_SID, YOUR_AUTH_TOKEN);

module.exports.userRenderEnterMobileNumberForOtp = async (req, res, next) => {
    try {
       if (req.session.isUserLoggedIn) {
          res.redirect("/");
       } else {
          res.render("Users/enter-number", { phoneError: req.session.phoneError, login: true });
          req.session.phoneError = " ";
       }
    } catch (error) {
   
       res.redirect("/error");
    }
 }

 module.exports.phoneCheck = async (req, res, next) => { ///To check whether the number exist in database
    try {
       req.session.OTP_RECEIVED_NUMBER = req.query.phonenumber;
 
       userHelpers
          .checkPhoneNumber(req.query.phonenumber)
          .then((data) => {
             if (data.status) {
                next();
             } else {
                req.session.phoneError = data.message;
                res.redirect("/phonenumber");
             }
          })
          .catch((error) => {
            
             res.redirect("/error");
          });
    } catch (error) {
     
       res.redirect("/error");
    }
 };

getUser = (req, res, next) => { //to get user details from the mobile number
   try {
       userHelpers.getUserDetails(req.session.OTP_RECEIVED_NUMBER).then((data)=>{
         console.log('inside getuser');
         console.log('details,',data);
         req.session.userDetail = data
       })
   } catch (error) {
      
      res.redirect("/error");
   }
};

module.exports.isUserLogged = async (req, res, next) => {
    if (req.session.isUserLoggedIn) {
       next();
    } else {
       res.redirect("/login");
    }
 };

 module.exports.userResentOtpForLogin = async (req, res, next) => {
    try {
       if (req.session.isUserLoggedIn) {
          res.redirect("/");
       } else {
          client.verify
             .services(SERVICE_SID) // Change service ID
             .verifications.create({
                to: `+91${req.session.OTP_RECEIVED_NUMBER}`,
                channel: "sms",
             })
             .then((data) => {
                res.status(200).send({
                   message: "Verification is sent!!",
                   phonenumber: req.query.phonenumber,
                   data,
                });
             })
             .catch((data) => {});
          getUser(req, res, next);
          res.json({ status: true });
       }
    } catch (error) {
      console.log('three');
       res.redirect("/error");
    }
 }

 module.exports.userSendOtp = async (req, res, next) => {
    try {
      if (req.session.isUserLoggedIn) {
         res.redirect("/");
      } else {
         client.verify
            .services(SERVICE_SID) // Change service ID
            .verifications.create({
               to: `+91${req.session.OTP_RECEIVED_NUMBER}`,
               channel: "sms",
            })
            .then((data) => {
               res.status(200).send({
                  message: "Verification is sent!!",
                  phonenumber: req.query.phonenumber,
                  data,
               });
            })
            .catch((data) => {
               console.log(data);
            });
         getUser(req, res, next);
         res.render("Users/enter-otp", { login: true, invalidOtp: req.session.invalidOtp });
         req.session.invalidOtp = false;
      }
    } catch (error) {
      res.redirect('/error')
    }
       
    
 }

 module.exports.userVerifyOtp = async (req, res) => {
   console.log('====================');
   console.log(req.session.userDetail)
   console.log('===================');
    try {
       if (req.session.isUserLoggedIn) {
          res.redirect("/");
       } else {
          client.verify
             .services(SERVICE_SID) // Change service ID
             .verificationChecks.create({
                to: `+91${req.session.OTP_RECEIVED_NUMBER}`,
                code: req.query.otp,
             })
             .then((data) => {
                if (data.status === "approved") {
                   req.session.user = req.session.userDetail;
                   req.session.isUserLoggedIn = true;
                   res.redirect("/");
                } else {
                   req.session.invalidOtp = true;
                   res.redirect("/otp");
                }
             })
             .catch((data) => {
               console.log('seven');
                console.log(data);
             });
       }
    } catch (error) {
      console.log('seven')
       res.redirect("/error");
    }
 }