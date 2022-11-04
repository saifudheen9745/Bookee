let productHelpers = require('../helpers/productHelpers')
let userHelpers = require('../helpers/userHelpers')
let db = require("../config/connection");
let { ObjectId } = require("mongodb");
let collection = require("../config/collections");

module.exports.checkSession = async (req, res, next) => {
    if (req.session.adminloggedIn) {
       next();
    } else {
       res.redirect("/admin/");
    }
 }

module.exports.adminGetAllUsers = async (req, res, next) => {
    try {
       userHelpers
          .getUsers()
          .then((users) => {
             res.render("Admin/users", { admin: true, users });
          })
          .catch((err) => {
             res.redirect("/admin/error");
          });
    } catch (error) {
       res.redirect("/admin/error");
    }
 }

 module.exports.adminBlockOrUnblockUsers = async (req, res, next) => {
    try {
       userHelpers
          .blockorunblock(req.body)
          .then((data) => {
             res.json(req.body.a);
          })
          .catch((error) => {
             res.redirect("/admin/error");
          });
    } catch (error) {
       res.redirect("/admin/error");
    }
 }

module.exports.adminGetAllNotification = async (req, res, next) => {
    try {
       userHelpers
          .getNotifications()
          .then((data) => {
             res.render("Admin/notification", { admin: true, data});
          })
          .catch((error) => {
             res.redirect("/admin/error");
          });
    } catch (error) {
       res.redirect("/admin/error");
    }
 }

 module.exports.adminGetSalesReport = async (req, res, next) => {
    try {
       Daily = await userHelpers.getDailySalesReportDownload();
       Monthly = await userHelpers.getMonthlySalesReportDownload();
       Yearly = await userHelpers.getYearlySalesReportDownload();
 
       res.render("Admin/salesreport", {
          admin: true,
          DailySalesforDownload: Daily.getDailysalesreportfordownload,
          totalDaily: Daily.total,
          MonthlySalesforDownload: Monthly.getMonthlysalesreportfordownload,
          totalMonthly: Monthly.total,
          YearlySalesforDownload: Yearly.getyearlysalesreportfordownload,
          totalYearly: Yearly.total,
       });
    } catch (error) {
       res.redirect("/admin/error");
    }
 }