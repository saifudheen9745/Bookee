let productHelpers = require('../helpers/productHelpers')
let userHelpers = require('../helpers/userHelpers')
let db = require("../config/connection");
let { ObjectId } = require("mongodb");
let collection = require("../config/collections");

module.exports.adminGetAllOrders = async (req, res, next) => {
    try {
       userHelpers
          .getAllOrdersAdmin()
          .then((allOrders) => {
             res.render("Admin/orders", { admin: true, allOrders });
          })
          .catch((error) => {
             res.redirect("/admin/error");
          });
    } catch (error) {
       res.redirect("/admin/error");
    }
 }

 module.exports.adminGetOneOrderDetails = async (req, res, next) => {
    try {
       req.session.oneOrderDetails = await userHelpers.getOrderSummary(req.params.orderId);
       res.json({ status: true });
    } catch (error) {
       res.redirect("/admin/error");
    }
 }

 module.exports.adminRenderOneOrderDetails = async (req, res, next) => {
    try {
       oid = req.session.oneOrderDetails[0]._id;
       gt = req.session.oneOrderDetails[0].grandTotal;
       ot = req.session.oneOrderDetails[0].timeoforder;
       billingAddress = req.session.oneOrderDetails[0].billingAddress;
       res.render("Admin/orderdetailsadmin", {
          admin: true,
          oneOrderDetails: req.session.oneOrderDetails,
          oid,
          gt,
          ot,
          billingAddress,
       });
    } catch (error) {
       res.redirect("/admin/error");
    }
 }

 module.exports.adminUpdateOrderStatus = async (req, res, next) => {
    try {
       userHelpers
          .changeOrderStatus(req.body)
          .then((data) => {
             res.json({ status: true });
          })
          .catch((error) => {
             res.redirect("/admin/error");
          });
    } catch (error) {
       res.redirect("/admin/error");
    }
 }

 module.exports.adminAcceptOrderReturns = async (req, res, next) => {
   console.log(req.body);
    try {
       userHelpers
          .returnOrderStatusChange(req.body)
          .then((data) => {
             userHelpers
                .addAmountToWallet(req.body)
                .then((data) => {
                   res.json({});
                })
                .catch((error) => {
                   res.redirect("/admin/error");
                });
          })
          .catch((error) => {
             res.redirect("/admin/error");
          });
    } catch (error) {
       res.redirect("/admin/error");
    }
 }