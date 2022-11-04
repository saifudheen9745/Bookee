let productHelpers = require('../helpers/productHelpers')
let userHelpers = require('../helpers/userHelpers')
let db = require("../config/connection");
let { ObjectId } = require("mongodb");
let collection = require("../config/collections");
 
 
 module.exports.adminGetAllCoupons = async (req, res, next) => {
    try {
       userHelpers
          .getAllCoupons()
          .then((data) => {
             res.render("Admin/tokens", { admin: true, data });
          })
          .catch((error) => {
             res.redirect("/admin/error");
          });
    } catch (error) {
       res.redirect("/admin/error");
    }
 }

 module.exports.adminCreateCoupon = async (req, res, next) => {
    try {
       userHelpers
          .createCoupon(req.body)
          .then((data) => {
             res.json({});
          })
          .catch((error) => {
             res.redirect("/admin/error");
          });
    } catch (error) {
       res.redirect("/admin/error");
    }
 }

 module.exports.adminGetOneCoupon = async (req, res, next) => {
    try {
       userHelpers
          .getOneCoupon(req.body)
          .then((data) => {
             res.json(data);
          })
          .catch((error) => {
             res.redirect("/admin/error");
          });
    } catch (error) {
       res.redirect("/admin/error");
    }
 }

 module.exports.adminEditCoupon = async (req, res, next) => {
    try {
       userHelpers
          .editCoupons(req.body)
          .then((data) => {
             res.json();
          })
          .catch((error) => {
             res.redirect("/admin/error");
          });
    } catch (error) {
       res.redirect("/admin/error");
    }
 }

 module.exports.adminDeleteCoupon = async (req, res, next) => {
    try {
       userHelpers
          .deleteCoupons(req.body)
          .then((data) => {
             res.json();
          })
          .catch((error) => {
             res.redirect("/admin/error");
          });
    } catch (error) {
       res.redirect("/admin/error");
    }
 }