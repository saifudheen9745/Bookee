let productHelpers = require('../helpers/productHelpers')
let userHelpers = require('../helpers/userHelpers')
let db = require("../config/connection");
let { ObjectId } = require("mongodb");
let collection = require("../config/collections");


module.exports.adminLoginPage =  async (req, res, next) => {
    res.render("Admin/login", { admin: true, loginPage: true, error: req.session.error, admin });
    req.session.error = "";
}

module.exports.adminLoginPagePost = async (req, res, next) => {
    let pass = req.body.password;
    let mail = req.body.username;
    if (pass === admin.password && mail === admin.email) {
       req.session.error = "";
       req.session.adminloggedIn = true;
       req.session.admin = admin;
       res.redirect("/admin/home");
    } else if (mail === null || mail === "") {
       req.session.error = "Email must not be empty";
       res.redirect("/admin/");
    } else if (pass === null || pass === "") {
       req.session.error = "Password must not be empty";
       res.redirect("/admin/");
    } else {
       req.session.error = "Invalid email or password";
       res.redirect("/admin/");
    }
}

module.exports.adminLogout = async (req, res, next) => {
    req.session.adminloggedIn = false;
    req.session.admin = "";
    res.redirect("/admin/");
}

module.exports.adminAbout = async (req, res, next) => {
    res.render("Admin/about", { admin: true })
}

module.exports.adminHome = async function (req, res, next) {
    try {
       let monthlysales = await userHelpers.monthlySales();
       let dailysales = await userHelpers.dailysales();
       let todaysnumberofsales = await userHelpers.todaysNumberOfSales();
       let thismonthsnumberofsales = await userHelpers.thisMonthsNumberOfSales();
       let thisyearsnumberofsales = await userHelpers.thisYearsNumberOfSales();
       let yearlysales = await userHelpers.yearlySales();
       let TopSellingProducts = await userHelpers.getTopSellingProducts();
       let Daily = await userHelpers.getDailySalesReportDownload();
       let Monthly = await userHelpers.getMonthlySalesReportDownload();
       let Yearly = await userHelpers.getYearlySalesReportDownload();
       res.render("Admin/home", {
          admin: true,
          monthlysales,
          dailysales,
          yearlysales,
          TopSellingProducts,
          totalDaily: Daily.total,
          totalMonthly: Monthly.total,
          totalYearly: Yearly.total,
          todaysnumberofsales,
          thismonthsnumberofsales,
          thisyearsnumberofsales,
       });
    } catch (error) {
       res.redirect("/admin/error");
    }
 }

 module.exports.adminErrorPage = (req, res, next) => {
    try {
       res.render("Admin/pages-error-404", { login: true });
    } catch (error) {
       res.redirect("/admin/error");
    }
 }

