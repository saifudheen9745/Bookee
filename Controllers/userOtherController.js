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

module.exports.userGetHomePage =  async (req, res, next) => {
    try {
       if (req.session.isUserLoggedIn) {
          req.session.grandTotal = await userHelpers.getCartTotal(req.session.user._id);
          productHelpers
             .getProductUsers()
             .then(async (products) => {
                productHelpers
                   .getCategories()
                   .then(async (categories) => {
                      productHelpers
                         .getNewArrivals()
                         .then(async (newarrivals) => {
                            userHelpers
                               .getOfferProducts()
                               .then(async (offerproducts) => {
                                  var cartitems = await userHelpers.getCartItems(req.session.user._id);
                                  try {
                                     req.session.cartcount = await userHelpers.getCartCount(req.session.user._id);
                                  } catch (error) {
                                    req.session.cartcount = 0;
                                  }
                                  
                                  res.render("Users/user-home", {
                                     products,
                                     userLogged: req.session.isUserLoggedIn,
                                     newarrivals,
                                     categories,
                                     cartitems,
                                     cartcount: req.session.cartcount,
                                     offerproducts: offerproducts.products,
                                     user: req.session.user,
                                     searchproducts: req.session.searchproducts,
                                  });
                               })
                               .catch((error) => {
                                  res.redirect("/error");
                               });
                         })
                         .catch((error) => {
                            res.redirect("/error");
                         });
                   })
                   .catch((error) => {
                      res.redirect("/error");
                   });
             })
             .catch((error) => {
                res.redirect("/error");
             });
       } else {
          res.redirect("/login");
       }
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userGetAccountDetails = async (req, res, next) => {
    try {
       userHelpers
          .getAddresses(req.session.user._id)
          .then(async (address) => {
             userHelpers
                .getAllOrders(req.session.user._id)
                .then(async (allOrders) => {
                   userHelpers
                      .getOneUser(req.session.user._id)
                      .then(async (userdetails) => {
                         try {
                            cartCount = await userHelpers.getCartCount(req.session.user._id);
                         } catch (error) {
                            req.session.cartCount = 0;
                         }
                         userHelpers
                            .getWallet(req.session.user._id)
                            .then(async (wallet) => {
                               
                               res.render("Users/useraccount", {
                                  userLogged: req.session.isUserLoggedIn,
                                  allOrders,
                                  userdetails,
                                  address,
                                  user: req.session.user._id,
                                  wallet,
                                  cartcount: req.session.cartcount,
                                  user: req.session.user,
                               });
                            })
                            .catch(async (wallet) => {
                               res.render("Users/useraccount", {
                                  userLogged: req.session.isUserLoggedIn,
                                  allOrders,
                                  userdetails,
                                  address,
                                  user: req.session.user._id,
                                  wallet,
                                  cartcount:req.session.cartCount,
                                  user: req.session.user,
                               });
                            });
                      })
                      .catch((error) => {
                         res.redirect("/error");
                      });
                })
                .catch((error) => {
                   res.redirect("/error");
                });
          })
          .catch((error) => {
             res.redirect("/error");
          });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userGetOneProductDetails = async (req, res, next) => {

    try {
       productHelpers
          .getOneProduct(req.params.id)
          .then(async (data) => {
             productHelpers
                .getOneCategory(data[0].Genre)
                .then(async (category) => {
                   req.session.productData = data[0]; //passing products to a variable as global
                   req.session.categoryInProduct = category;
                   res.redirect("/products");
                })
                .catch((error) => {
                   res.redirect("/error");
                });
          })
          .catch((error) => {
             res.redirect("/error");
          });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userRenderProductPageWithOneDetail = async function (req, res, next) {
   console.log(req.session.productData);
   
    
       if (req.session.productData == null || req.session.productData == undefined) {
          res.redirect("/");
       } else {
         console.log(req.session);
          res.render("Users/show-products", {
             productData: req.session.productData,
             categoryInProduct: req.session.categoryInProduct,
             userLogged: req.session.isUserLoggedIn,
             cartcount: req.session.cartcount,
          });
       }
    
 }

 module.exports.userGetOneCategoryDetails = async function (req, res, next) {
    try {
       catdetails = {
          id: req.params.id,
       };
       productHelpers
          .getOneCategory(catdetails.id)
          .then(async (data) => {
             req.session.categoryData = data;
             req.session.categoryId = catdetails.id;
             res.redirect("/category");
          })
          .catch((error) => {
             res.redirect("/error");
          });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userRenderCategoryWithOneDetail = async (req, res, next) => {
    try {
       try {
          cartcount = await userHelpers.getCartCount(req.session.user._id);
       } catch (error) {
          cartcount = 0;
       }
 
       res.render("Users/category", {
          categoryData: req.session.categoryData,
          userLogged: req.session.isUserLoggedIn,
          cartcount,
       });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userGetCart = async (req, res, next) => {
    try {
       var cartitems = await userHelpers.getCartItems(req.session.user._id);
       var grandTotal = await userHelpers.getCartTotal(req.session.user._id);
       try {
          cartcount = await userHelpers.getCartCount(req.session.user._id);
       } catch (error) {
          cartcount = 0;
       }
 
       //cartcount = cartcount[0].products.length
       if (cartcount != 0) {
          displayCheckout = true;
       } else {
          displayCheckout = false;
       }
       res.render("Users/cart", {
          admin: false,
          cartitems,
          grandTotal: grandTotal[0].grandTotal,
          userLogged: req.session.isUserLoggedIn,
          cartcount,
          displayCheckout,
       });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userAddToCart = async (req, res, next) => {
    try {
       userHelpers
          .addToCart(req.params.id, req.session.user._id)
          .then((data) => {
            console.log(data);
             res.json(data);
          })
          .catch((error) => {
             res.redirect("/error");
          });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userDeleteFromCart = async (req, res, next) => {
    try {
       userHelpers
          .deleteFromCart(req.body.product, req.session.user._id)
          .then(async (data) => {
             var grandTotal = await userHelpers.getCartTotal(req.session.user._id);
             grandTotal = grandTotal[0].grandTotal;
             data = {
                grandTotal: grandTotal,
                status: true,
             };
             res.send(data);
          })
          .catch((error) => {
             res.redirect("/error");
          });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userChangeProductQuantityInCart = async (req, res, next) => {
    try {
       userHelpers
          .changeQuantity(req.body)
          .then(async (data) => {
             userHelpers
                .getCartTotal(req.session.user._id)
                .then(async (grandtotal) => {
                   data = {
                      status: data.changeQty,
                      grandtotal: grandtotal[0].grandTotal,
                   };
                   try {
                      cartcount = await userHelpers.getCartCount(req.session.user._id);
                   } catch (error) {
                      cartcount = 0;
                   }
 
                   res.send(data);
                })
                .catch((error) => {
                   res.redirect("/error");
                });
          })
          .catch((error) => {
             res.redirect("/error");
          });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userGetCheckout = async function (req, res, next) {
    try {
       var coupons = await userHelpers.getCoupons();
       var cartitems = await userHelpers.getCartItems(req.session.user._id);
       var addresses = await userHelpers.getAddresses(req.session.user._id);
       var grandTotal = await userHelpers.getCartTotal(req.session.user._id);
       try {
          var cartcount = await userHelpers.getCartCount(req.session.user._id);
       } catch (error) {
          cartcount = 0;
       }
 
       grandTotal = grandTotal[0].grandTotal;
       if (addresses.length != 0) {
          placeorder = true;
       } else {
          placeorder = false;
       }
       if(cartcount != 0){
         res.render("Users/checkout", {
            coupons,
            admin: false,
            userLogged: req.session.isUserLoggedIn,
            grandTotal,
            cartitems,
            user: req.session.user,
            addresses,
            cartcount,
            placeorder,
         });
       }else{
         res.redirect('/')
       }
       
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userAddAddress = async (req, res, next) => {
    try {
       userHelpers
          .addAddress(req.body)
          .then((response) => {
             res.send({ status: true });
          })
          .catch((error) => {
             res.redirect("/error");
          });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userGetOneAddressDetailsToEdit = async (req, res, nexxt) => {
    try {
       let address = await userHelpers.getOneAddress(req.params.id);
 
       res.send(address);
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userEditAddressPost = async (req, res, next) => {
    try {
       userHelpers
          .editAddress(req.body)
          .then((data) => {
             res.redirect("/account");
          })
          .catch((error) => {
             res.redirect("/error");
          });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userDeleteAddress = async (req, res, next) => {
    try {
       userHelpers
          .deleteAddress(req.body)
          .then(() => {
             res.send({ status: true });
          })
          .catch((errror) => {
             res.redirect("/error");
          });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userPlaceOrder = async (req, res, next) => {
    try {
       cartProducts = await userHelpers.getCartProducts(req.session.user._id);
       if (cartProducts == null) {
       } else {
          grandTotal = req.body.gtotal;
          if (req.body.paymentmethod === "Wallet") {
             userHelpers
                .getWallet(req.session.user._id)
                .then((WalletBalance) => {
                   if (parseInt(WalletBalance.Balance) >= parseInt(grandTotal)) {
                      userHelpers
                         .placeOrderForWallet(cartProducts, grandTotal, req.body, WalletBalance.Balance)
                         .then((data) => {
                            data.walletStatus = true;
                            noWalletBalance = false;
                            res.json(data);
                         })
                         .catch((error) => {
                            res.redirect("/error");
                         });
                   } else {
                      
                      let data = { walletStatus: true, noWalletBalance: true };
                      res.json(data);
                   }
                })
                .catch((data) => {
                   data.walletStatus = false;
                   res.json(data);
                });
          } else {
             userHelpers
                .placeOrder(cartProducts, grandTotal, req.body)
                .then((data) => {
                   if (req.body.paymentmethod === "Cod") {
                      userHelpers.clearCart(req.session.user._id);
                      data.codStatus = true;
                      res.json(data);
                   } else if (req.body.paymentmethod === "Razorpay") {
                      userHelpers.generateRazorpay(data.insertedId, grandTotal).then((response) => {
                        response.user = req.session.user
                         res.json(response);
                      });
                   } else if (req.body.paymentmethod === "Paypal") {
                      res.json({ paypalStatus: true, orderId: data.insertedId, grandTotal: grandTotal });
                   }
                })
                .catch((error) => {
                   res.redirect("/error");
                });
          }
       }
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userRetryPayment = (req,res,next)=>{
    userHelpers.generateRazorpay(req.body.orderId,req.body.amount).then((response)=>{
      response.user = req.session.user
       res.json(response)
    })
 }

 module.exports.userOrderSummaryAfterPlaceOrder = async (req, res, next) => {
   try {
      req.session.orderedProducts = await userHelpers.getOrderSummary(req.params.id);
       req.session.timeoforder = req.session.orderedProducts[0].timeoforder;
       req.session.grandTotal = req.session.orderedProducts[0].grandTotal;
       res.redirect("/ordersummary");
   } catch (error) {
      res.redirect('/error')
   }
      
       
    
 }

 module.exports.userRenderOrderSummary = async (req, res, next) => {

    try {
       res.render("Users/order-summary", {
          admin: false,
          orderedProducts: req.session.orderedProducts,
          timeoforder: req.session.timeoforder,
          grandTotal: req.session.grandTotal,
          userLogged: req.session.isUserLoggedIn,
          cartcount:req.session.cartcount,
       });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userGetAllOrders = async (req, res, next) => {
    try {
       userHelpers
          .getAllOrders(req.session.user._id)
          .then(async (allOrders) => {
             try {
                var cartcount = await userHelpers.getCartCount(req.session.user._id);
             } catch (error) {
                cartcount = 0;
             }
             res.render("Users/orders", {
                admin: false,
                userLogged: req.session.isUserLoggedIn,
                cartcount,
                allOrders,
                user: req.session.user,
             });
          })
          .catch((error) => {
             res.redirect("/error");
          });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userGetOneOrderDetailsFromAllOrders = async (req, res, next) => {
    try {
       req.session.oneOrderDetails = await userHelpers.getOrderSummary(req.params.id);
       res.json({ status: true });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userRenderOneOrderDetails = async (req, res, next) => {
    try {
       oid = req.session.oneOrderDetails[0]._id;
       gt = req.session.oneOrderDetails[0].grandTotal;
       ot = req.session.oneOrderDetails[0].timeoforder;
       billingAddress = req.session.oneOrderDetails[0].billingAddress;
 
       res.render("Users/orderdetails", {
          admin: false,
          userLogged: req.session.isUserLoggedIn,
          oneOrderDetails: req.session.oneOrderDetails,
          gt,
          ot,
          oid,
          billingAddress,
          user: req.session.user,
          cartcount:req.session.cartcount
       });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userCancelOrder = async (req, res, next) => {
    try {
       userHelpers
          .cancelOrder(req.body)
          .then((data) => {
             userHelpers
                .addAmountToWallet(req.body)
                .then(() => {
                   res.json({ status: true });
                })
                .catch((error) => {
                   res.redirect("/error");
                });
          })
          .catch((error) => {
             res.redirect("/error");
          });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userRenderReturnOrderPage = async (req, res, next) => {
    try {
       userHelpers
          .returnOrder(req.query.prodId, req.query.orderId)
          .then((data) => {
             res.render("Users/returnOrder", {
                userLogged: req.session.isUserLoggedIn,
                admin: false,
                user: req.session.user,
                prodId: req.query.prodId,
                orderId: req.query.orderId,
                data,
             });
          })
          .catch((error) => {
             res.redirect("/error");
          });
    } catch (error) {
       res.redirect("/errror");
    }
 }

 module.exports.userReturnOrderPost = async (req, res, next) => {
    try {
       userHelpers
          .returnOrderCollection(req.body)
          .then((data) => {
             res.json({ route: "/getorderdetails/" + req.body.orderId });
          })
          .catch((error) => {
             res.redirect("/error");
          });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userVerifyPayment = async (req, res, next) => {
    try {
       userHelpers
          .verifyPayment(req.body)
          .then(() => {
             userHelpers
                .changePaymentStatus(req.body["order[receipt]"])
                .then((orderId) => {
                   userHelpers
                      .getCartProducts(req.session.user._id)
                      .then((products) => {
                         userHelpers
                            .decrementStockForNonCod(products)
                            .then((data) => {
                               userHelpers
                                  .clearCart(req.session.user._id)
                                  .then((data) => {
                                     res.json({ status: true, orderId });
                                  })
                                  .catch((error) => {
                                     res.redirect("/error");
                                  });
                            })
                            .catch((error) => {
                               res.redirect("/error");
                            });
                      })
                      .catch((error) => {
                         res.redirect("/error");
                      });
                })
                .catch((error) => {
                   res.redirect("/error");
                });
          })
          .catch((err) => {
             res.json({ status: false });
          });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userPaypalSuccessRoute = async (req, res, next) => {
    try {
       userHelpers
          .changePaymentStatus(req.params.orderId)
          .then((orderId) => {
             userHelpers
                .getCartProducts(req.session.user._id)
                .then((products) => {
                   userHelpers
                      .decrementStockForNonCod(products)
                      .then((data) => {
                         userHelpers
                            .clearCart(req.session.user._id)
                            .then((data) => {
                               res.redirect("/ordersummary/" + req.params.orderId);
                            })
                            .catch((error) => {
                               res.redirect("/error");
                            });
                      })
                      .catch((error) => {
                         res.redirect("/error");
                      });
                })
                .catch((error) => {
                   res.redirect("/error");
                });
          })
          .catch((error) => {
             res.redirect("/error");
          });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userPaypalCancelRoute = async (req, res, next) => {
    try {
       res.redirect("/ordersummary/" + req.params.orderId);
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userPaypalPaymentGenerationAndVerification = (req, res, next) => {
    try {
       const create_payment_json = {
          intent: "sale",
          payer: {
             payment_method: "paypal",
          },
          redirect_urls: {
             return_url: "http://localhost:3000/success/" + req.body.orderId,
             cancel_url: "http://localhost:3000/cancel/" + req.body.orderId,
          },
          transactions: [
             {
                item_list: {
                   items: [
                      {
                         name: "Red Sox Hat",
                         sku: "001",
                         price: "25.00",
                         currency: "USD",
                         quantity: 1,
                      },
                   ],
                },
                amount: {
                   currency: "USD",
                   total: "25.00",
                },
                description: "Hat for the best team ever",
             },
          ],
       };
 
       paypal.payment.create(create_payment_json, async function (error, payment) {
          if (error) {
             throw error;
          } else {
             for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === "approval_url") {
                   res.json(payment.links[i].href);
                }
             }
          }
       });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userChangePasswordFromAccountPage = async (req, res, next) => {
    try {
       userHelpers
          .changePassword(req.body, req.session.user._id)
          .then((data) => {
             res.json(data);
          })
          .catch((error) => {
             res.redirect("/error");
          });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userChangeAccountDetails = (req, res, next) => {
    try {
       userHelpers
          .changeAccountDetails(req.body, req.session.user._id)
          .then((data) => {
             res.json(data);
          })
          .catch((error) => {
             res.redirect("/error");
          });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userRenderErrorPage = async (req, res, next) => {
    try {
       res.render("Users/pages-error-404", { login: true });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userGetWishlist = async (req, res, next) => {
    try {
       userHelpers
          .getWishList()
          .then(async (data) => {
            console.log(data.length);
             try {
                var cartcount = await userHelpers.getCartCount(req.session.user._id);
             } catch (error) {
                cartcount = 0;
             }
             res.render("Users/wishlist", {
                cartcount,
                userLogged: req.session.isUserLoggedIn,
                admin: false,
                user: req.session.user,
                data,
                wishlistcount : data.length
             });
          })
          .catch((error) => {
             res.redirect("/error");
          });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userAddProductToWishlist = async (req, res, next) => {
    try {
       userHelpers
          .addtowishlist(req.params.id, req.session.user._id)
          .then((response) => {
             res.json(response);
          })
          .catch((error) => {
             res.redirect("/error");
          });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userDeleteProductFromWishlist = async (req, res, next) => {
    try {
       userHelpers
          .deleteFromWishlist(req.body, req.session.user._id)
          .then((data) => {
             res.json(data);
          })
          .catch((error) => {
             res.redirect("/error");
          });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userApplyCoupon = async (req, res, next) => {
    try {
       userHelpers
          .checkCoupon(req.body, req.session.user._id)
          .then((data) => {
             res.json(data);
          })
          .catch((error) => {
             res.redirect("/error");
          });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userSearchProducts = (req, res, next) => {
    try {
       productHelpers
          .searchProducts(req.body)
          .then((data) => {
             req.session.searchproducts = data;
             res.json(data);
          })
          .catch((error) => {
             res.redirect("/error");
          });
    } catch (error) {
      console.log("haii");
       res.redirect("/error");
    }
 }

 module.exports.userSendOtpForForgotPassword = (req, res, next) => {
    try {
       req.session.forgotPasswordResetNumber = req.params.number;
       console.log(req.params.number);
       userHelpers
          .checkPhoneNumber(req.params.number)
          .then((data) => {
            console.log(data);
             if (data.status) {
                client.verify
                   .services(SERVICE_SID) // Change service ID
                   .verifications.create({
                      to: `+91${req.params.number}`,
                      channel: "sms",
                   })
                   .then((data) => {
                     console.log('here');
                      res.status(200).send({
                         message: "Verification is sent!!",
                         phonenumber: req.params.phonenumber,
                         data,
                      });
                   })
                   .catch((data) => {
                     console.log(data);
                   });
             }
             res.json(data);
          })
    } catch (error) {
      
       res.redirect("/error");
    }
 }

 module.exports.userVerifyOtpForForgotPassword = (req, res, next) => {
    try {
       client.verify
          .services(SERVICE_SID) // Change service ID
          .verificationChecks.create({
             // to: `+91${req.body.phonenumber}`,
             to: `+91${req.session.forgotPasswordResetNumber}`,
             code: req.params.otp,
          })
          .then((data) => {
             if (data.status === "approved") {
                res.json({ status: true });
             } else {
                res.json({ status: false });
             }
          })
          .catch((data) => {
             console.log(data);
          });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userChangePasswordForForgotPassword = (req, res, next) => {
    try {
       userHelpers
          .changePassworForForgotPassword(req.body)
          .then((data) => {
             res.json({ status: true });
          })
          .catch((error) => {
             res.redirect("/error");
          });
    } catch (error) {
       res.redirect("/error");
    }
 }

 module.exports.userApplyFilter = (req, res, next) => {
    try {
       userHelpers
          .applyFilters(req.body, req.session.categoryId)
          .then((data) => {
             res.json(data);
          })
          .catch((error) => {
             res.redirect("/error");
          });
    } catch (error) {
       res.redirect("/error");
    }
 }