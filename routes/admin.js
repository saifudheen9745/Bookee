let express = require("express");
const { upload, upload2 } = require("../public/javascripts/fileUpload");
let router = express.Router();

const {
   adminLoginPage,
   adminLoginPagePost,
   adminLogout,
   adminAbout,
   adminHome,
   adminErrorPage,
} = require("../Controllers/adminLoginControllers");
const {
   adminGetAllProducts,
   adminAddProductQuantity,
   adminAddProducts,
   adminAddProductPost,
   adminGetOneProductDetailsToEdit,
   adminEditProductPost,
   adminDeleteProduct,
   adminProductOfferManagementPage,
   adminAddProductToOffer,
   adminDeleteProductFromOffer,
   adminChangeDiscountRate,
} = require("../Controllers/adminProductControllers.");
require("dotenv").config();
const {
   adminGetAllUsers,
   adminBlockOrUnblockUsers,
   adminGetAllNotification,
   adminGetSalesReport,
   checkSession,
} = require("../Controllers/adminUserControllers");
const {
   adminGetAllCoupons,
   adminCreateCoupon,
   adminGetOneCoupon,
   adminEditCoupon,
   adminDeleteCoupon,
} = require("../Controllers/adminCouponControllers");
const {
   adminGetAllOrders,
   adminGetOneOrderDetails,
   adminRenderOneOrderDetails,
   adminUpdateOrderStatus,
   adminAcceptOrderReturns,
} = require("../Controllers/adminOrderControllers");
const {
   adminGetAllCategories,
   adminAddCategory,
   adminAddCategoryPost,
   adminEditCategoryPost,
   adminGetOneCategoryDetailsToEdit,
} = require("../Controllers/adminCategoryController");

// admin cred

admin = {
   username: process.env.Admin_username,
   email: process.env.Admin_email,
   password: process.env.Admin_password,
};


//Login Related

router.get("/", adminLoginPage);

router.post("/", adminLoginPagePost);

router.get("/logout", adminLogout);

router.get("/about", checkSession, adminAbout);

router.get("/home", checkSession, adminHome);

//error-page admin

router.get("/error", adminErrorPage);

// users related

router.get("/users", checkSession, adminGetAllUsers);

router.post("/changeuserstatus", adminBlockOrUnblockUsers);

//Products related

router.get("/products", checkSession, adminGetAllProducts);

router.post("/addProductQuantity", adminAddProductQuantity);

router.get("/add-product", checkSession, adminAddProducts);

router.post("/add-product", upload.array("image"), adminAddProductPost);

router.get("/edit-product/:id", checkSession, adminGetOneProductDetailsToEdit);

router.post("/edit-product/:id", upload.array("image"), adminEditProductPost);

router.get("/delete-product/:id", checkSession, adminDeleteProduct);

//Coupon Related

router.get("/coupons", checkSession, adminGetAllCoupons);

router.post("/create-coupon", adminCreateCoupon);

router.post("/getOneCoupon", adminGetOneCoupon);

router.post("/edit-coupon", adminEditCoupon);

router.delete("/delete-coupon", adminDeleteCoupon);

//ProductOffer

router.get("/productoffer-management", checkSession, adminProductOfferManagementPage);

router.post("/add-product-offer", adminAddProductToOffer);

router.post("/deleteofferproduct", adminDeleteProductFromOffer);

router.post("/changeDiscountRate", adminChangeDiscountRate);

//Order Related

router.get("/orders", checkSession, adminGetAllOrders);

router.post("/getOneOrder/:orderId", adminGetOneOrderDetails);

router.get("/order-details", checkSession, adminRenderOneOrderDetails);

router.post("/updateOrderStatus", adminUpdateOrderStatus);

router.post("/acceptreturnorder", checkSession, adminAcceptOrderReturns);

//Category Related

router.get("/categories", adminGetAllCategories);

router.get("/add-category", adminAddCategory);

router.post("/add-category", upload2.any("CategoryImage"), adminAddCategoryPost);

router.get("/edit-category/:id", adminGetOneCategoryDetailsToEdit);

router.post("/edit-category/:id", upload2.any("CategoryImage"), adminEditCategoryPost);

//Others

router.get("/notification", checkSession, adminGetAllNotification); // The code is to get all return requested Orders (it is in usercontroller)

router.get("/salesreport", checkSession, adminGetSalesReport);

module.exports = router;
