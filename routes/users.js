var express = require("express");
var router = express.Router();
const paypal = require("paypal-rest-sdk");
const { userRenderEnterMobileNumberForOtp, phoneCheck, isUserLogged ,getUser, userResentOtpForLogin, userSendOtp, userVerifyOtp } = require("../Controllers/userOtpController");
const { userLoginPost,  userRenderLoginSignupPage, userSignupPost, userLogout } = require("../Controllers/userLoginSignupController");
const { userGetHomePage, userGetAccountDetails, userGetOneProductDetails, userRenderProductPageWithOneDetail, userGetOneCategoryDetails, userRenderCategoryWithOneDetail, userGetCart, userAddToCart, userDeleteFromCart, userChangeProductQuantityInCart, userGetCheckout, userAddAddress, userGetOneAddressDetailsToEdit, userEditAddressPost, userDeleteAddress, userPlaceOrder, userRetryPayment, userOrderSummaryAfterPlaceOrder, userRenderOrderSummary, userGetAllOrders, userGetOneOrderDetailsFromAllOrders, userRenderOneOrderDetails, userCancelOrder, userRenderReturnOrderPage, userReturnOrderPost, userVerifyPayment, userPaypalSuccessRoute, userPaypalCancelRoute, userPaypalPaymentGenerationAndVerification, userChangePasswordFromAccountPage, userChangeAccountDetails, userRenderErrorPage, userGetWishlist, userAddProductToWishlist, userDeleteProductFromWishlist, userApplyCoupon, userSearchProducts, userSendOtpForForgotPassword, userVerifyOtpForForgotPassword, userChangePasswordForForgotPassword, userApplyFilter } = require("../Controllers/userOtherController");

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





// OTP Related

router.get("/phonenumber", userRenderEnterMobileNumberForOtp);

router.get("/resendOtp", userResentOtpForLogin);

router.get("/otp", phoneCheck, userSendOtp);

router.get("/verify", userVerifyOtp);

// Login Related

router.get("/login", userRenderLoginSignupPage);

router.post("/login", userLoginPost);

router.get("/logout", userLogout);

router.post("/signup", userSignupPost);

router.get("/account", isUserLogged, userGetAccountDetails);

router.get("/", isUserLogged, userGetHomePage);

router.get("/product-details/:id", isUserLogged, userGetOneProductDetails);

router.get("/products", isUserLogged, userRenderProductPageWithOneDetail);


router.get("/category/:id", isUserLogged, userGetOneCategoryDetails);

//real category showing page
router.get("/category", isUserLogged, userRenderCategoryWithOneDetail);

router.get("/cart", isUserLogged, userGetCart);

router.get("/add-to-cart/:id", userAddToCart);

router.delete("/delete-from-cart", userDeleteFromCart);

router.post("/change-product-quantity", userChangeProductQuantityInCart);

router.get("/checkout", isUserLogged, userGetCheckout);

router.post("/addAddress", userAddAddress);

router.post("/get-address/:id", userGetOneAddressDetailsToEdit);

router.post("/edit-address", userEditAddressPost);

router.delete("/delete-address", userDeleteAddress);

router.post("/place-order", isUserLogged, userPlaceOrder);

router.post('/retry-payment',userRetryPayment)

router.get("/ordersummary/:id", userOrderSummaryAfterPlaceOrder);

router.get("/ordersummary", userRenderOrderSummary);

router.get("/orders", isUserLogged, userGetAllOrders);

router.get("/get-one-order-detail/:id", userGetOneOrderDetailsFromAllOrders);

router.get("/getorderdetails", isUserLogged, userRenderOneOrderDetails);

router.post("/cancel-order", userCancelOrder);

router.get("/returnOrder", isUserLogged, userRenderReturnOrderPage);

router.post("/returnOrder", userReturnOrderPost);

router.post("/verify-payment", userVerifyPayment);

router.get("/success/:orderId", userPaypalSuccessRoute);

router.get("/cancel", userPaypalCancelRoute);

router.post("/paypal", userPaypalPaymentGenerationAndVerification );

router.post("/changepassword", userChangePasswordFromAccountPage);

router.put("/changeaccountdetails", userChangeAccountDetails);

router.get("/error", userRenderErrorPage);

router.get("/wishlist", isUserLogged, userGetWishlist);

router.get("/addToWishlist/:id", userAddProductToWishlist);

router.delete("/deleteFromWishlist", userDeleteProductFromWishlist);

router.post("/apply-coupon", userApplyCoupon );

router.post("/searchproducts", userSearchProducts);

router.get("/sendOtpForForgotPassword/:number", userSendOtpForForgotPassword);

router.get("/verifyOtpForForgotPassword/:otp", userVerifyOtpForForgotPassword);

router.put("/changePasswordForForgotPassword", userChangePasswordForForgotPassword);

router.post("/applyFilter", userApplyFilter);

module.exports = router;
