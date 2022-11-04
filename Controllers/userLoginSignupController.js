var express = require("express");
var router = express.Router();
var productHelpers = require("../helpers/productHelpers");
var userHelpers = require("../helpers/userHelpers");
const paypal = require("paypal-rest-sdk");


module.exports.userRenderLoginSignupPage = async function (req, res, next) {
    try {
       if (req.session.isUserLoggedIn) {
          res.redirect("/");
       } else {
          res.render("Users/login-signup", {
             login: true,
             loginError: req.session.loginError,
             signupError: req.session.signupError,
          });
          req.session.loginError = " ";
          req.session.signupError = " ";
       }
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userLoginPost = async function (req, res, next) {
    try {
       let userData = {
          mail: req.body.email,
          pass: req.body.password,
       };
       userHelpers
          .doLogIn(userData)
          .then((data) => {
             if (data.status) {
                req.session.user = data.user;
                req.session.isUserLoggedIn = true; //changing isloggedin to true
                res.redirect("/");
             } else {
                req.session.loginError = data.error;
                res.redirect("/login");
             }
          })
          .catch((error) => {
             res.redirect("/error");
          });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userSignupPost = async (req, res, next) => {
    try {
       userHelpers
          .doSignUp(req.body)
          .then((data) => {
             req.session.signupError = data.message;
             res.redirect("/login");
          })
          .catch((error) => {
             res.redirect("/error");
          });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userLogout = async (req, res, next) => {
    try {
       req.session.isUserLoggedIn = false;
       res.redirect("/login");
    } catch (error) {
       res.redirect("/error");
    }
 }