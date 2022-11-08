var db = require("../config/connection");
var bcrypt = require("bcrypt");
var { ObjectId } = require("mongodb");
var collection = require("../config/collections");
const Razorpay = require("razorpay");
let shortid = require("shortid");

require("dotenv").config();

let productOfferRate = 0;

let date = new Date();
let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();
let monthoforder = [year, month].join("-");
let currentDate = `${day}-${month}-${year}`;
var hour = date.getHours();
hour = (hour < 10 ? "0" : "") + hour;
var min = date.getMinutes();
min = (min < 10 ? "0" : "") + min;
var sec = date.getSeconds();
sec = (sec < 10 ? "0" : "") + sec;
let currentTime = `${hour}:${min}:${sec}`;

var instance = new Razorpay({ key_id: process.env.Razorpay_key, key_secret: process.env.Razorpay_key_secret });

module.exports = {
   doSignUp: (userData) => {
      let referalid
      if (userData.referalId == null || userData.referalId == '') {
         referalid = null
      }else{
         referalid = userData.referalId;
      }
      

      userData.referalcode = `REF-${shortid.generate()}`;
      delete userData.referalId;

      let mail = userData.email;
      let response = {
         signUpErr: false,
         referalErr: false,
         message: "",
      };

      return new Promise(async (resolve, reject) => {
         try {
            let user = await db.get().collection(collection.USER_COLLECTION).count({ email: mail });
            if (user != 0) {
               response.message = "User with that email already exist";
               response.signUpErr = true;
               resolve(response);
            } else {
               let user = await db.get().collection(collection.USER_COLLECTION).count({ mobile: userData.mobile });
               if (user != 0) {
                  response.message = "User with that mobile number already exist";
                  response.signUpErr = true;
                  resolve(response);
               } else {
                 
                  if (referalid != null) {
                    
                     let benefactor = await db
                        .get()
                        .collection(collection.USER_COLLECTION)
                        .find({ referalcode: referalid })
                        .toArray();
                     if (benefactor.length != 0) {
                        let walletExist = await db
                           .get()
                           .collection(collection.WALLET_COLLECTION)
                           .findOne({ user: ObjectId(benefactor[0]._id) });
                        if (walletExist != null) {
                           let currentBalance = walletExist.Balance;
                           let newBalance = parseInt(currentBalance) + 25;
                           let transactionObj = {
                              date: currentDate,
                              time: currentTime,
                              oldbalance: currentBalance,
                              credit: 25,
                              debit: 0,
                              newbalance: newBalance,
                           };

                           db.get()
                              .collection(collection.WALLET_COLLECTION)
                              .updateOne(
                                 { user: ObjectId(benefactor[0]._id) },
                                 { $set: { Balance: parseInt(newBalance) }, $push: { transactions: transactionObj } }
                              );
                        } else {
                           let currentBalance = 0;
                           let newBalance = currentBalance + 25;
                           let transactionObj = {
                              date: currentDate,
                              time: currentTime,
                              oldbalance: currentBalance,
                              credit: 25,
                              debit: 0,
                              newbalance: parseInt(newBalance),
                           };
                           let walletObj = {
                              user: ObjectId(benefactor[0]._id),
                              Balance: 25,
                              transactions: [transactionObj],
                           };
                           db.get().collection(collection.WALLET_COLLECTION).insertOne(walletObj); //createing wallet if benefactor doesn't already have one
                        }
                        userData.blocked = false;
                        userData.password = await bcrypt.hash(userData.password, 10);
                        db.get()
                           .collection("user")
                           .insertOne(userData)
                           .then((data) => {
                              let currentBalance = 0;
                              let newBalance = currentBalance + 25;
                              let transactionObj = {
                                 date: currentDate,
                                 time: currentTime,
                                 oldbalance: currentBalance,
                                 credit: 25,
                                 debit: 0,
                                 newbalance: parseInt(newBalance),
                              };
                              let walletObj = {
                                 user: ObjectId(data.insertedId),
                                 Balance: 25,
                                 transactions: [transactionObj],
                              };
                              db.get().collection(collection.WALLET_COLLECTION).insertOne(walletObj);
                              response.data = data;
                              resolve(response);
                           });
                     } else {
                        response.referalErr = true;
                        response.message = "Invalid Referral code";
                        resolve(response);
                     }
                  } else {
                     userData.blocked = false;
                     userData.password = await bcrypt.hash(userData.password, 10);
                     db.get().collection("user").insertOne(userData);
                     response.signUpErr = false,
                     response.referalErr = false,
                     response.message = "",
                     resolve(response)
                  }
               }
            }
         } catch (error) {
            reject();
         }
      });
   },

   doLogIn: (userData) => {
      let response = {};
      let mail = userData.mail;
      return new Promise(async (resolve, reject) => {
         try {
            if (userData.mail === "" && userData.pass === "") {
               response.status = false;
               response.error = "Please enter email and password";
               resolve(response);
            }
            let user = await db.get().collection("user").findOne({ email: mail });

            if (user) {
               if (user.blocked == true) {
                  response.status = false;
                  response.error = "This user is bloked by admin";

                  resolve(response);
               } else {
                  bcrypt.compare(userData.pass, user.password).then((status) => {
                     if (status) {
                        response.user = user;
                        response.status = true;
                        response.error = "";
                        response.user = user;
                        resolve(response);
                     } else {
                        response.status = false;
                        response.error = "Invalid email or password";
                        resolve(response);
                     }
                  });
               }
            } else {
               response.status = false;
               response.error = "invalid email or password";
               resolve(response);
            }
         } catch (error) {
            reject(error);
         }
      });
   },

   getUsers: () => {
      return new Promise(async (resolve, reject) => {
         try {
            let users = await db.get().collection(collection.USER_COLLECTION).find().toArray();
            resolve(users);
         } catch (error) {
            reject(error);
         }
      });
   },
   deleteUser: (userData) => {
      var id = ObjectId(userData.id);
      return new Promise((resolve, reject) => {
         try {
            db.get()
               .collection(collection.USER_COLLECTION)
               .deleteOne({ _id: id })
               .then((data) => {
                  resolve(data);
               });
         } catch (error) {
            reject(error);
         }
      });
   },
   getOneUser: (userData) => {
      id = ObjectId(userData);
      return new Promise(async (resolve, reject) => {
         try {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: id });
            resolve(user);
         } catch (error) {
            reject(error);
         }
      });
   },
   blockorunblock: (userDetails) => {
      if (userDetails.a == "true") {
         userDetails.a = true;
      } else {
         userDetails.a = false;
      }
      return new Promise((resolve, reject) => {
         try {
            db.get()
               .collection(collection.USER_COLLECTION)
               .updateOne({ _id: ObjectId(userDetails.userId) }, { $set: { blocked: userDetails.a } })
               .then((data) => {
                  resolve();
               });
         } catch (error) {
            reject(error);
         }
      });
   },
   updateUser: (userData) => {
      response = {
         updateErr: false,
         message: "",
         id: userData.id,
      };
      id = ObjectId(userData.id);
      return new Promise(async (resolve, reject) => {
         try {
            let user = await db
               .get()
               .collection("user")
               .count({ $and: [{ email: userData.email }, { _id: { $ne: id } }] });

            if (user != 0) {
               (response.updateErr = true), (response.message = "User with that email already exists");
               resolve(response);
            } else {
               db.get()
                  .collection("user")
                  .updateOne({ _id: id }, { $set: { blocked: userData.blocked } })
                  .then((data) => {
                     resolve(response);
                  });
            }
         } catch (error) {
            reject(error);
         }
      });
   },
   checkPhoneNumber: (phone) => {
      // To check the user is blocked or not in otp login and to make sure an user exists with this mobile number
      userExist = {
         status: false,
      };
      return new Promise(async (resolve, reject) => {
         try {
            let user = await db.get().collection(collection.USER_COLLECTION).count({ mobile: phone });
            let USER = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile: phone });

            if (user != 0) {
               if (USER.blocked) {
                  userExist.message = "This user is blocked by admin";
                  resolve(userExist);
               } else {
                  userExist.status = true;
                  userExist.userId = USER._id;
                  resolve(userExist);
               }
            } else {
               userExist.message = "User with that number does not exist";
               resolve(userExist);
            }
         } catch (error) {
            reject(error);
         }
      });
   },
   getUserDetails: (phone) => {

      return new Promise(async (resolve, reject) => {
         try {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile: phone });
            resolve(user);
         } catch (error) {
            reject();
         }
      });
   },

   addToCart: (productId, userId) => {
      prodObj = {
         item: ObjectId(productId),
         quantity: 1,
      };
      return new Promise(async (resolve, reject) => {
         try {
            let productCount = await db
               .get()
               .collection(collection.PRODUCTS_COLLECTION)
               .find({ _id: prodObj.item })
               .toArray();

            if (productCount[0].Quantity < 1) {
               resolve({ status: false });
            } else {
               let cart = await db
                  .get()
                  .collection(collection.CART_COLLECTION)
                  .count({ user: ObjectId(userId) });

               if (cart != 0) {
                  cartItems = await db
                     .get()
                     .collection(collection.CART_COLLECTION)
                     .find({ user: ObjectId(userId) })
                     .toArray();
                  let products = cartItems[0].products;
                  prodExist = products.findIndex((arr) => arr.item == productId);
                  let cartProdQty;
                  products.map((prods) => {
                     if (prods.item == productId) {
                        cartProdQty = prods.quantity;
                     }
                  });

                  if (prodExist != -1) {
                     if (cartProdQty + 1 > productCount[0].Quantity) {
                        resolve({ status: false });
                     } else {
                        db.get()
                           .collection(collection.CART_COLLECTION)
                           .updateOne(
                              { user: ObjectId(userId), "products.item": ObjectId(productId) },
                              {
                                 $inc: { "products.$.quantity": 1 },
                              }
                           )
                           .then((data) => {
                              resolve({ status: true });
                           });
                     }
                  } else {
                     db.get()
                        .collection(collection.CART_COLLECTION)
                        .updateOne({ user: ObjectId(userId) }, { $push: { products: prodObj } })
                        .then((data) => {
                           resolve({ incNumber: true, status: true });
                        });
                  }
               } else {
                  let cartObj = {
                     user: ObjectId(userId),
                     products: [prodObj],
                  };
                  db.get()
                     .collection(collection.CART_COLLECTION)
                     .insertOne(cartObj)
                     .then((data) => {
                        resolve({ status: true, incNumber: true });
                     });
               }
            }
         } catch (error) {
            reject();
         }
      });
   },

   getCartItems: (userId) => {
      return new Promise(async (resolve, reject) => {
         try {
            let cartItems = await db
               .get()
               .collection(collection.CART_COLLECTION)
               .aggregate([
                  {
                     $match: {
                        user: ObjectId(userId),
                     },
                  },
                  {
                     $unwind: "$products",
                  },
                  {
                     $project: {
                        item: "$products.item",
                        quantity: "$products.quantity",
                     },
                  },
                  {
                     $lookup: {
                        from: collection.PRODUCTS_COLLECTION,
                        localField: "item",
                        foreignField: "_id",
                        as: "cartItems",
                     },
                  },
                  {
                     $project: {
                        item: 1,
                        quantity: 1,
                        cartItems: { $arrayElemAt: ["$cartItems", 0] },
                     },
                  },
                  {
                     $project: {
                        item: 1,
                        quantity: 1,
                        cartItems: 1,
                        totalPrice: { $multiply: ["$quantity", "$cartItems.Offerprice"] },
                     },
                  },
                  {
                     $project: {
                        item: 1,
                        quantity: 1,
                        cartItems: 1,
                        totalPrice: 1,
                     },
                  },
               ])
               .toArray();

            resolve(cartItems);
         } catch (error) {
            reject();
         }
      });
   },
   getCartTotal: (userId) => {
      return new Promise(async (resolve, reject) => {
         try {
            let cartItems = await db
               .get()
               .collection(collection.CART_COLLECTION)
               .aggregate([
                  {
                     $match: {
                        user: ObjectId(userId),
                     },
                  },
                  {
                     $unwind: "$products",
                  },
                  {
                     $project: {
                        item: "$products.item",
                        quantity: "$products.quantity",
                     },
                  },
                  {
                     $lookup: {
                        from: collection.PRODUCTS_COLLECTION,
                        localField: "item",
                        foreignField: "_id",
                        as: "cartItems",
                     },
                  },
                  {
                     $project: {
                        item: 1,
                        quantity: 1,
                        cartItems: { $arrayElemAt: ["$cartItems", 0] },
                     },
                  },
                  {
                     $project: {
                        item: 1,
                        quantity: 1,
                        cartItems: 1,
                        totalPrice: { $multiply: ["$quantity", "$cartItems.Offerprice"] },
                     },
                  },
                  {
                     $group: { _id: ObjectId(userId), grandTotal: { $sum: "$totalPrice" } },
                  },
               ])
               .toArray();
            sampleData = {
               _id: "",
               grandTotal: "0",
            };
            if (cartItems.length == 0) {
               cartItems.push(sampleData);
            }
            resolve(cartItems);
         } catch (error) {
            reject();
         }
      });
   },
   getCartCount: (userId) => {
      return new Promise(async (resolve, reject) => {
         try {
            cart = await db
               .get()
               .collection(collection.CART_COLLECTION)
               // .find({ user: ObjectId(userId) })
               // .toArray();
               .aggregate([
                  {
                     $match: {
                        user: ObjectId(userId),
                     },
                  },
                  {
                     $project: {
                        size: { $size: "$products" },
                     },
                  },
               ])
               .toArray();

            resolve(cart[0].size);
         } catch (error) {
            reject(0);
         }
      });
   },

   changeQuantity: (details) => {
      // Change quantity of the products in the cart
      product = ObjectId(details.product);
      cart = ObjectId(details.cart);
      count = parseInt(details.count);
      quantity = parseInt(details.quantity);
      return new Promise(async (resolve, reject) => {
         try {
            db.get()
               .collection(collection.CART_COLLECTION)
               .updateOne(
                  { _id: ObjectId(details.cart), "products.item": ObjectId(details.product) },
                  {
                     $inc: { "products.$.quantity": count },
                  }
               )
               .then((data) => {
                  resolve({ changeQty: true });
               });
         } catch (error) {
            reject();
         }
      });
   },
   deleteFromCart: (prodId, userId) => {
      return new Promise((resolve, reject) => {
         try {
            db.get()
               .collection(collection.CART_COLLECTION)
               .updateOne({ user: ObjectId(userId) }, { $pull: { products: { item: ObjectId(prodId) } } })
               .then((data) => {
                  resolve(data);
               });
         } catch (error) {
            reject();
         }
      });
   },
   getCartProducts: (userId) => {
      return new Promise(async (resolve, reject) => {
         try {
            cart = await db
               .get()
               .collection(collection.CART_COLLECTION)
               .findOne({ user: ObjectId(userId) });
            resolve(cart);
         } catch (error) {
            reject();
         }
      });
   },
   clearCart: (userId) => {
      //To clear cart after an order been placed successfully
      return new Promise((resolve, reject) => {
         try {
            db.get()
               .collection(collection.CART_COLLECTION)
               .deleteOne({ user: ObjectId(userId) });
            resolve();
         } catch (error) {
            reject(error);
         }
      });
   },

   addAddress: (address) => {
      let addressObj = {
         user: ObjectId(address.userId),
         firstName: address.firstname,
         lastName: address.lastname,
         companyName: address.companyname,
         country: address.country,
         housenumberorstreetname: address.housenumberORStreetname,
         appartment: address.appartment,
         townorcity: address.townORcity,
         stateorcounty: address.stateORcounty,
         postcode: address.postalcode,
         phone: address.phone,
         email: address.email,
      };
      return new Promise((resolve, reject) => {
         try {
            db.get()
               .collection(collection.ADDRESS_COLLECTION)
               .insertOne(addressObj)
               .then((data) => {
                  resolve(data);
               });
         } catch (error) {
            reject(error);
         }
      });
   },
   getAddresses: (userId) => {
      //To list the existing addresses in the checkout page
      return new Promise(async (resolve, reject) => {
         try {
            let addresses = await db
               .get()
               .collection(collection.ADDRESS_COLLECTION)
               .find({ user: ObjectId(userId) })
               .toArray();
            resolve(addresses);
         } catch (error) {
            reject(error);
         }
      });
   },
   getOneAddress: (addressId) => {
      //To find the address user selected in checkout page
      return new Promise(async (resolve, reject) => {
         try {
            address = await db
               .get()
               .collection(collection.ADDRESS_COLLECTION)
               .findOne({ _id: ObjectId(addressId) });
            resolve(address);
         } catch (error) {
            reject();
         }
      });
   },
   editAddress: (address) => {
      return new Promise((resolve, reject) => {
         try {
            db.get()
               .collection(collection.ADDRESS_COLLECTION)
               .updateOne(
                  { _id: ObjectId(address.addressId) },
                  {
                     $set: {
                        firstName: address.firstname,
                        lastName: address.lastname,
                        companyName: address.companyname,
                        country: address.country,
                        housenumberorstreetname: address.housenumberORStreetname,
                        appartment: address.appartment,
                        townorcity: address.townORcity,
                        stateorcounty: address.stateORcounty,
                        postcode: address.postalcode,
                        phone: address.phone,
                        email: address.email,
                     },
                  }
               );

            resolve();
         } catch (error) {
            reject();
         }
      });
   },
   deleteAddress: (addressId) => {
      return new Promise((resolve, reject) => {
         try {
            db.get()
               .collection(collection.ADDRESS_COLLECTION)
               .deleteOne({ _id: ObjectId(addressId.addressId) })
               .then((data) => {
                  resolve(data);
               });
         } catch (error) {
            reject(error);
         }
      });
   },

   placeOrder: (products, grandTotal, orderDetails) => {
      if(orderDetails.deductedAmount == '' || orderDetails.deductedAmount == null || orderDetails.deductedAmount == NaN){
         orderDetails.deductedAmount = 0
      }
      products.products.forEach((product) => {
         product.shipping = orderDetails.shipping;
      });
      return new Promise(async (resolve, reject) => {
         try {
            address = await db
               .get()
               .collection(collection.ADDRESS_COLLECTION)
               .findOne({ _id: ObjectId(orderDetails.address) });

            let status = orderDetails.paymentmethod === "Cod" ? "Placed" : "Pending";
            let orderObj = {
               user: ObjectId(address.user),
               grandTotal: parseInt(grandTotal),
               couponused: orderDetails.couponused,
               paymentmethod: orderDetails.paymentmethod,
               status: status,
               productCount:parseInt(orderDetails.cartCount),
               deductedOfferAmount:parseInt(orderDetails.deductedAmount),
               product: products,
               timeoforder: currentDate,
               monthoforder: monthoforder,
               yearoforder: year,
               billingAddress: address,
               timestamp: new Date(),
            };

            db.get()
               .collection(collection.ORDER_COLLECTION)
               .insertOne(orderObj)
               .then((data) => {
                  if (orderDetails.paymentmethod == "Cod") {
                     products.products.forEach((product) => {
                        qty = parseInt(0 - product.quantity);
                        db.get()
                           .collection(collection.PRODUCTS_COLLECTION)
                           .updateOne({ _id: ObjectId(product.item) }, { $inc: { Quantity: qty } });
                     });
                  }

                  db.get()
                     .collection(collection.COUPON_COLLECTION)
                     .updateOne({ coupon: orderDetails.couponused }, { $addToSet: { users: ObjectId(address.user)} });
                  resolve(data);
               });
         } catch (error) {
            reject(error);
         }
      });
   },
   placeOrderForWallet: (products, grandTotal, orderDetails, currentWalletBalance) => {
      if(orderDetails.deductedAmount == '' || orderDetails.deductedAmount == null || orderDetails.deductedAmount == NaN){
         orderDetails.deductedAmount = 0
      }
      products.products.forEach((product) => {
         product.shipping = orderDetails.shipping;
      });
      return new Promise(async (resolve, reject) => {
         try {
            address = await db
               .get()
               .collection(collection.ADDRESS_COLLECTION)
               .findOne({ _id: ObjectId(orderDetails.address) });

            let status = "Placed";
            let orderObj = {
               user: ObjectId(address.user),
               grandTotal: parseInt(grandTotal),
               couponused: orderDetails.couponused,
               paymentmethod: orderDetails.paymentmethod,
               productCount:parseInt(orderDetails.cartCount),
               deductedOfferAmount:parseInt(orderDetails.deductedAmount),
               status: status,
               product: products,
               timeoforder: currentDate,
               monthoforder: monthoforder,
               yearoforder: year,
               billingAddress: address,
               timestamp: new Date(),
            };

            db.get()
               .collection(collection.ORDER_COLLECTION)
               .insertOne(orderObj)
               .then((data) => {
                  products.products.forEach((product) => {
                     qty = parseInt(0 - product.quantity);
                     db.get()
                        .collection(collection.PRODUCTS_COLLECTION)
                        .updateOne({ _id: ObjectId(product.item) }, { $inc: { Quantity: qty } });
                  });
                  let newWalletBalance = parseInt(currentWalletBalance) - parseInt(grandTotal);
                  let date = new Date();
                  let day = date.getDate();
                  let month = date.getMonth() + 1;
                  let year = date.getFullYear();
                  let currentDate = `${day}-${month}-${year}`;
                  var hour = date.getHours();
                  hour = (hour < 10 ? "0" : "") + hour;
                  var min = date.getMinutes();
                  min = (min < 10 ? "0" : "") + min;
                  var sec = date.getSeconds();
                  sec = (sec < 10 ? "0" : "") + sec;
                  let currentTime = `${hour}:${min}:${sec}`;
                  let transactionObj = {
                     date: currentDate,
                     time: currentTime,
                     oldbalance: parseInt(currentWalletBalance),
                     credit: 0,
                     debit: parseInt(grandTotal),
                     newbalance: newWalletBalance,
                  };
                  db.get()
                     .collection(collection.WALLET_COLLECTION)
                     .updateOne(
                        { user: ObjectId(address.user) },
                        { $set: { Balance: newWalletBalance }, $push: { transactions: transactionObj } }
                     );
                  resolve(data);
               });
         } catch (error) {
            reject(error);
         }
      });
   },

   getOrderSummary: (orderId) => {
      return new Promise(async (resolve, reject) => {
         try {
            let orderitems = await db
               .get()
               .collection(collection.ORDER_COLLECTION)
               .aggregate([
                  {
                     $match: {
                        _id: ObjectId(orderId),
                     },
                  },
                  {
                     $unwind: "$product.products",
                  },
                  {
                     $lookup: {
                        from: collection.PRODUCTS_COLLECTION,
                        localField: "product.products.item",
                        foreignField: "_id",
                        as: "coot",
                     },
                  },
                  {
                     $project: {
                        user: 1,
                        grandTotal: 1,
                        paymentmethod: 1,
                        productCount:1,
                        deductedOfferAmount:1,
                        status: 1,
                        product: 1,
                        timeoforder: 1,
                        billingAddress: 1,
                        orderedProducts: { $arrayElemAt: ["$coot", 0] },
                     },
                  },
               ])
               .toArray();

            resolve(orderitems);
         } catch (error) {
            reject();
         }
      });
   },
   getAllOrders: (userId) => {
      //With a user id
      return new Promise(async (resolve, reject) => {
         try {
            let allOrders = await db
               .get()
               .collection(collection.ORDER_COLLECTION)
               .find({ user: ObjectId(userId) })
               .sort({ timestamp: -1 })
               .toArray();
            resolve(allOrders);
         } catch (error) {
            reject();
         }
      });
   },
   getAllOrdersAdmin: () => {
      // without a user id
      return new Promise(async (resolve, reject) => {
         try {
            let allOrders = await db
               .get()
               .collection(collection.ORDER_COLLECTION)
               .aggregate([
                  {
                     $lookup: {
                        from: collection.USER_COLLECTION,
                        localField: "user",
                        foreignField: "_id",
                        as: "userInfo",
                     },
                  },
                  {
                     $project: {
                        user: 1,
                        grandTotal: 1,
                        paymentmethod: 1,
                        productCount:1,
                        deductedOfferAmount:1,
                        timestamp: 1,
                        status: 1,
                        product: 1,
                        timeoforder: 1,
                        billingAddress: 1,
                        userinfo: { $arrayElemAt: ["$userInfo", 0] },
                     },
                  },
               ])
               .sort({ timestamp: -1 })
               .toArray();

            resolve(allOrders);
         } catch (error) {
            reject();
         }
      });
   },
   cancelOrder: ({ prodId, orderId }) => {
      return new Promise((resolve, reject) => {
         try {
            db.get()
               .collection(collection.ORDER_COLLECTION)
               .updateOne(
                  { _id: ObjectId(orderId), "product.products.item": ObjectId(prodId) },
                  { $set: { "product.products.$.shipping": "Cancelled" } }
               )
               .then((data) => {
                  resolve(data);
               });
         } catch (error) {
            reject();
         }
      });
   },
   returnOrder: (prodId, orderId) => {
      return new Promise(async (resolve, reject) => {
         try {
            item = await db
               .get()
               .collection(collection.ORDER_COLLECTION)
               .aggregate([
                  {
                     $match: {
                        _id: ObjectId(orderId),
                     },
                  },
                  {
                     $unwind: "$product.products",
                  },
                  {
                     $match: {
                        "product.products.item": ObjectId(prodId),
                     },
                  },
                  {
                     $lookup: {
                        from: collection.PRODUCTS_COLLECTION,
                        localField: "product.products.item",
                        foreignField: "_id",
                        as: "returnedProduct",
                     },
                  },
                  {
                     $project: {
                        user: 1,
                        grandTotal: 1,
                        paymentmethod: 1,
                        status: 1,
                        product: 1,
                        timeoforder: 1,
                        billingAddress: 1,
                        prodInfo: { $arrayElemAt: ["$returnedProduct", 0] },
                     },
                  },
               ])
               .toArray();

            resolve(item[0]);
         } catch (error) {
            reject(error);
         }
      });
   },
   returnOrderCollection: (orderReturnDetails) => {
      orderReturnDetails.prodId = ObjectId(orderReturnDetails.prodId);
      orderReturnDetails.userId = ObjectId(orderReturnDetails.userId);
      orderReturnDetails.orderId = ObjectId(orderReturnDetails.orderId);
      return new Promise((resolve, reject) => {
         try {
            db.get().collection(collection.RETURN_ORDER_COLLECTION).insertOne(orderReturnDetails);
            db.get()
               .collection(collection.ORDER_COLLECTION)
               .updateOne(
                  { _id: orderReturnDetails.orderId, "product.products.item": orderReturnDetails.prodId },
                  { $set: { "product.products.$.shipping": "Return-requested" } }
               );
            resolve();
         } catch (error) {
            reject(error);
         }
      });
   },
   changeOrderStatus: (details) => {
      return new Promise((resolve, reject) => {
         try {
            db.get()
               .collection(collection.ORDER_COLLECTION)
               .updateOne(
                  { _id: ObjectId(details.orderId), "product.products.item": ObjectId(details.prodId) },
                  { $set: { "product.products.$.shipping": details.status } }
               )
               .then((data) => {
                  resolve(data);
               });
         } catch (error) {
            reject();
         }
      });
   },
   returnOrderStatusChange: ({ orderId, userId, prodId, status }) => {
      return new Promise(async (resolve, reject) => {
         try {
            db.get()
               .collection(collection.ORDER_COLLECTION)
               .updateOne(
                  { _id: ObjectId(orderId), "product.products.item": ObjectId(prodId) },
                  { $set: { "product.products.$.shipping": status } }
               )
               .then((data) => {
                  resolve({ status: true });
               });
         } catch (error) {
            reject(error);
         }
      });
   },

   decrementStockForNonCod: (cartItems) => {
      return new Promise((resolve, reject) => {
         try {
            cartItems.products.forEach((product) => {
               qty = parseInt(0 - product.quantity);
               db.get()
                  .collection(collection.PRODUCTS_COLLECTION)
                  .updateOne({ _id: ObjectId(product.item) }, { $inc: { Quantity: qty } });
            });
            resolve();
         } catch (error) {
            reject(error);
         }
      });
   },

   generateRazorpay: (orderId, grandTotal) => {
      return new Promise((resolve, reject) => {
         var options = {
            amount: parseInt(grandTotal) * 100,
            currency: "INR",
            receipt: "" + orderId,
         };
         instance.orders.create(options, (err, order) => {
            if (err) {
            } else {

               resolve(order);
            }
         });
      });
   },
   verifyPayment: (details) => {

      return new Promise((resolve, reject) => {
         try {
            const crypto = require("crypto");
            var hmac = crypto.createHmac("sha256", "IvttksLwUIKBGICPRCLEIrED");
            hmac.update(details["payment[razorpay_order_id]"] + "|" + details["payment[razorpay_payment_id]"]);
            hmac = hmac.digest("hex");
            if (hmac == details["payment[razorpay_signature]"]) {
               resolve();
            } else {
               reject();
            }
         } catch (error) {
            reject(error);
         }
      });
   },

   changePaymentStatus: (orderId) => {
      return new Promise((resolve, reject) => {
         try {
            db.get()
               .collection(collection.ORDER_COLLECTION)
               .updateOne({ _id: ObjectId(orderId) }, { $set: { status: "Placed" } })
               .then((data) => {
                  resolve(orderId);
               });
         } catch (error) {
            reject(error);
         }
      });
   },

   changePassword: (passDetails, userId) => {
      response = {};
      return new Promise(async (resolve, reject) => {
         try {
            let user = await db
               .get()
               .collection(collection.USER_COLLECTION)
               .findOne({ _id: ObjectId(userId) });
            bcrypt.compare(passDetails.currentpassword, user.password).then(async (status) => {
               if (status) {
                  if (passDetails.newpassword == passDetails.retypepassword) {
                     let newpassword = await bcrypt.hash(passDetails.newpassword, 10);
                     db.get()
                        .collection(collection.USER_COLLECTION)
                        .updateOne({ _id: ObjectId(userId) }, { $set: { password: newpassword } })
                        .then((data) => {
                           response.status = true;
                           resolve(response);
                        });
                  } else {
                     response.message = "new password and confirm password does'nt match";
                     response.status = false;
                     resolve(response);
                  }
               } else {
                  response.message = "Invalid current password";
                  response.status = false;
                  resolve(response);
               }
            });
         } catch (error) {
            reject(error);
         }
      });
   },

   changeAccountDetails: ({ firstname, mobilenumber, email }, userId) => {
      return new Promise(async (resolve, reject) => {
         try {
            response = {};
            let emailExistForAnotherUser = await db
               .get()
               .collection(collection.USER_COLLECTION)
               .count({ $and: [{ email: email }, { _id: { $ne: ObjectId(userId) } }] });
            if (emailExistForAnotherUser != 0) {
               response.status = false;
               response.message = "Another user with the entered email exist";
               resolve(response);
            } else {
               let mobileExistForAnotherUser = await db
                  .get()
                  .collection(collection.USER_COLLECTION)
                  .count({ $and: [{ mobile: mobilenumber }, { _id: { $ne: ObjectId(userId) } }] });
               if (mobileExistForAnotherUser != 0) {
                  response.status = false;
                  response.message = "Another user with the entered mobile exist";
                  resolve(response);
               } else {
                  db.get()
                     .collection(collection.USER_COLLECTION)
                     .updateOne(
                        { _id: ObjectId(userId) },
                        { $set: { name: firstname, mobile: mobilenumber, email: email } }
                     );
                  response.status = true;
                  response.message = "Account details changed successfully";
                  resolve(response);
               }
            }
         } catch (error) {
            reject(error);
         }
      });
   },

   getNotifications: () => {
      return new Promise(async (resolve, reject) => {
         try {
            let notificationItems = await db
               .get()
               .collection(collection.RETURN_ORDER_COLLECTION)
               .aggregate([
                  {
                     $lookup: {
                        from: collection.ORDER_COLLECTION,
                        localField: "orderId",
                        foreignField: "_id",
                        as: "orderDetails",
                     },
                  },
                  {
                     $project: {
                        userId: 1,
                        prodId: 1,
                        orderId: 1,
                        productCount:1,
                        deductedOfferAmount:1,
                        returnStatus: 1,
                        orderDetails: { $arrayElemAt: ["$orderDetails", 0] },
                        reason: 1,
                     },
                  },
                  {
                     $unwind: "$orderDetails.product.products",
                  },
                  {
                     $match: {
                        "orderDetails.product.products.shipping": {
                           $in: ["Return-requested", "Return-Approved"],
                        },
                     },
                  },

                  {
                     $lookup: {
                        from: collection.PRODUCTS_COLLECTION,
                        localField: "orderDetails.product.products.item",
                        foreignField: "_id",
                        as: "prodDetails",
                     },
                  },

                  {
                     $lookup: {
                        from: collection.ADDRESS_COLLECTION,
                        localField: "userId",
                        foreignField: "user",
                        as: "addressDetails",
                     },
                  },
                  {
                     $lookup: {
                        from: collection.USER_COLLECTION,
                        localField: "userId",
                        foreignField: "_id",
                        as: "userDetails",
                     },
                  },
                  {
                     $project: {
                        _id: 1,
                        userId: 1,
                        prodId: 1,
                        orderId: 1,
                        deductedOfferAmount:1,
                        returnStatus: 1,
                        returnStatus: 1,
                        reason: 1,
                        orderDetails: 1,
                        prodDetails: { $arrayElemAt: ["$prodDetails", 0] },
                        addressDetails: { $arrayElemAt: ["$addressDetails", 0] },
                        userDetails: { $arrayElemAt: ["$userDetails", 0] },
                     },
                  },
                  {
                     $match: {
                        $expr: { $eq: ["$prodDetails._id", "$prodId"] },
                     },
                  },
               ])
               .toArray();
              
            resolve(notificationItems);
         } catch (error) {
            reject(error);
         }
      });
   },

   dailysales: () => {
      return new Promise(async (resolve, reject) => {
         try {
            let dailysales = await db
               .get()
               .collection(collection.ORDER_COLLECTION)
               .aggregate([
                  {
                     $unwind: "$product.products",
                  },
                  {
                     $match: {
                        "product.products.shipping": {
                           $nin: ["Cancelled"],
                        },
                     },
                  },
                  {
                     $lookup: {
                        from: collection.PRODUCTS_COLLECTION,
                        localField: "product.products.item",
                        foreignField: "_id",
                        as: "proDetails",
                     },
                  },
                  {
                     $project: {
                        timeoforder: 1,
                        prodDetails: { $arrayElemAt: ["$proDetails", 0] },
                        proQty: "$product.products.quantity",
                     },
                  },
                  {
                     $project: {
                        proQty: 1,
                        timeoforder: 1,
                        prodPrice: "$prodDetails.Offerprice",
                     },
                  },
                  {
                     $group: {
                        _id: "$timeoforder",
                        count: { $sum: 1 },
                        dailySales: { $sum: { $multiply: ["$proQty", "$prodPrice"] } },
                     },
                  },
                  {
                     $sort: {
                        _id: 1,
                     },
                  },
               ])
               .toArray();

            resolve(dailysales);
         } catch (error) {
            reject(error);
         }
      });
   },
   monthlySales: () => {
      return new Promise(async (resolve, reject) => {
         try {
            let monthysales = await db
               .get()
               .collection(collection.ORDER_COLLECTION)
               .aggregate([
                  {
                     $unwind: "$product.products",
                  },
                  {
                     $match: {
                        "product.products.shipping": {
                           $nin: ["Cancelled"],
                        },
                     },
                  },
                  {
                     $lookup: {
                        from: collection.PRODUCTS_COLLECTION,
                        localField: "product.products.item",
                        foreignField: "_id",
                        as: "proDetails",
                     },
                  },
                  {
                     $project: {
                        monthoforder: 1,
                        prodDetails: { $arrayElemAt: ["$proDetails", 0] },
                        proQty: "$product.products.quantity",
                     },
                  },
                  {
                     $project: {
                        proQty: 1,
                        monthoforder: 1,
                        prodPrice: "$prodDetails.Price",
                     },
                  },
                  {
                     $group: {
                        _id: "$monthoforder",
                        monthlySales: { $sum: { $multiply: ["$proQty", "$prodPrice"] } },
                     },
                  },
               ])
               .toArray();
            resolve(monthysales);
         } catch (error) {
            reject(error);
         }
      });
   },
   yearlySales: () => {
      return new Promise(async (resolve, reject) => {
         try {
            let yearlysales = await db
               .get()
               .collection(collection.ORDER_COLLECTION)
               .aggregate([
                  {
                     $unwind: "$product.products",
                  },
                  {
                     $match: {
                        "product.products.shipping": {
                           $nin: ["Cancelled"],
                        },
                     },
                  },
                  {
                     $lookup: {
                        from: collection.PRODUCTS_COLLECTION,
                        localField: "product.products.item",
                        foreignField: "_id",
                        as: "proDetails",
                     },
                  },
                  {
                     $project: {
                        yearoforder: 1,
                        prodDetails: { $arrayElemAt: ["$proDetails", 0] },
                        proQty: "$product.products.quantity",
                     },
                  },
                  {
                     $project: {
                        proQty: 1,
                        yearoforder: 1,
                        prodPrice: "$prodDetails.Price",
                     },
                  },
                  {
                     $group: {
                        _id: "$yearoforder",
                        yearlySales: { $sum: { $multiply: ["$proQty", "$prodPrice"] } },
                     },
                  },
               ])
               .toArray();
            resolve(yearlysales);
         } catch (error) {
            reject(error);
         }
      });
   },

   getDailySalesReportDownload: () => {
      return new Promise((resolve, reject) => {
         try {
            db.get()
               .collection(collection.ORDER_COLLECTION)
               .aggregate([
                  {
                     $group: {
                        _id: "$timeoforder",
                        DailySaleAmount: { $sum: "$grandTotal" },
                        count: { $sum: 1 },
                     },
                  },
                  {
                     $sort: {
                        _id: -1,
                     },
                  },
                  {
                     $limit: 30,
                  },
               ])
               .toArray()
               .then((getDailysalesreportfordownload) => {
                  dailysalestotal = 0;
                  getDailysalesreportfordownload.forEach((each) => (dailysalestotal += each.DailySaleAmount));
                  response = {
                     getDailysalesreportfordownload: getDailysalesreportfordownload,
                     total: dailysalestotal,
                  };
                  resolve(response);
               });
         } catch (error) {
            reject(error);
         }
      });
   },
   getMonthlySalesReportDownload: () => {
      return new Promise((resolve, reject) => {
         try {
            db.get()
               .collection(collection.ORDER_COLLECTION)
               .aggregate([
                  {
                     $group: {
                        _id: "$monthoforder",
                        MonthlySaleAmount: { $sum: "$grandTotal" },
                        count: { $sum: 1 },
                     },
                  },
                  {
                     $sort: {
                        _id: -1,
                     },
                  },
                  {
                     $limit: 30,
                  },
               ])
               .toArray()
               .then((getMonthlysalesreportfordownload) => {
                  monthlysalestotal = 0;
                  getMonthlysalesreportfordownload.forEach((each) => (monthlysalestotal += each.MonthlySaleAmount));
                  response = {
                     getMonthlysalesreportfordownload: getMonthlysalesreportfordownload,
                     total: monthlysalestotal,
                  };
                  resolve(response);
               });
         } catch (error) {
            reject(error);
         }
      });
   },
   todaysNumberOfSales: () => {
      return new Promise(async (resolve, reject) => {
         try {
            let date = new Date();
            let day = date.getDate();
            let month = date.getMonth() + 1;
            let year = date.getFullYear();
            let monthoforder = [year, month].join("-");
            let currentDate = `${day}-${month}-${year}`;
            let todaysnumberofsales = await db
               .get()
               .collection(collection.ORDER_COLLECTION)
               .count({ timeoforder: currentDate });
            resolve(todaysnumberofsales);
         } catch (error) {
            reject();
         }
      });
   },
   thisMonthsNumberOfSales: () => {
      try {
         return new Promise(async (resolve, reject) => {
            let date = new Date();
            let day = date.getDate();
            let month = date.getMonth() + 1;
            let year = date.getFullYear();
            let currentmonth = [year, month].join("-");
            let thismonthsnumberofsales = await db
               .get()
               .collection(collection.ORDER_COLLECTION)
               .count({ monthoforder: currentmonth });
            resolve(thismonthsnumberofsales);
         });
      } catch (error) {
         reject();
      }
   },
   thisYearsNumberOfSales: () => {
      return new Promise(async (resolve, reject) => {
         try {
            let date = new Date();
            let currentyear = date.getFullYear();

            let thisyearsnumberofsales = await db
               .get()
               .collection(collection.ORDER_COLLECTION)
               .count({ yearoforder: currentyear });
            resolve(thisyearsnumberofsales);
         } catch (error) {
            reject(error);
         }
      });
   },
   getYearlySalesReportDownload: () => {
      return new Promise((resolve, reject) => {
         try {
            db.get()
               .collection(collection.ORDER_COLLECTION)
               .aggregate([
                  {
                     $group: {
                        _id: "$yearoforder",
                        YearlySaleAmount: { $sum: "$grandTotal" },
                        count: { $sum: 1 },
                     },
                  },
                  {
                     $sort: {
                        _id: -1,
                     },
                  },
                  {
                     $limit: 30,
                  },
               ])
               .toArray()
               .then((getyearlysalesreportfordownload) => {
                  yearlysalestotal = 0;
                  getyearlysalesreportfordownload.forEach((each) => (yearlysalestotal += each.YearlySaleAmount));
                  response = {
                     getyearlysalesreportfordownload: getyearlysalesreportfordownload,
                     total: yearlysalestotal,
                  };
                  resolve(response);
               });
         } catch (error) {
            reject();
         }
      });
   },

   getTopSellingProducts: () => {
      return new Promise(async (resolve, reject) => {
         try {
            topsellingproducts = await db
               .get()
               .collection(collection.ORDER_COLLECTION)
               .aggregate([
                  {
                     $unwind: "$product.products",
                  },
                  {
                     $lookup: {
                        from: collection.PRODUCTS_COLLECTION,
                        localField: "product.products.item",
                        foreignField: "_id",
                        as: "prodDetails",
                     },
                  },
                  {
                     $project: {
                        id: "$product.products.item",
                        detail: { $arrayElemAt: ["$prodDetails", 0] },
                     },
                  },
                  {
                     $group: {
                        _id: { prodDetails: "$detail" },
                        count: { $sum: 1 },
                     },
                  },
                  {
                     $sort: {
                        count: -1,
                     },
                  },
                  {
                     $limit: 5,
                  },
               ])
               .toArray();
            resolve(topsellingproducts);
         } catch (error) {
            reject(error);
         }
      });
   },

   addProductOffer: ({ prodId, status }) => {
      if (status == "false") {
         status = false;
      } else {
         status = true;
      }

      return new Promise(async (resolve, reject) => {
         try {
            product = await db
               .get()
               .collection(collection.PRODUCTS_COLLECTION)
               .findOne({ _id: ObjectId(prodId) });
            if (status) {
               //offerrate = await db.get().collection(collection.PRODUCTS_COLLECTION).findOne({ Hasoffer: true });
               offerrate = {
                  Offerrate: parseInt(productOfferRate),
               };
               db.get()
                  .collection(collection.PRODUCTS_COLLECTION)
                  .updateOne(
                     { _id: ObjectId(prodId) },
                     {
                        $set: {
                           Hasoffer: status,
                           Offerrate: offerrate.Offerrate,
                           Offerprice: product.Price - product.Price * (offerrate.Offerrate / 100),
                        },
                     }
                  );

               resolve();
            } else {
               db.get()
                  .collection(collection.PRODUCTS_COLLECTION)
                  .updateOne(
                     { _id: ObjectId(prodId) },
                     { $set: { Hasoffer: status, Offerrate: 0, Offerprice: product.Price } }
                  );
               resolve();
            }
         } catch (error) {
            reject(error);
         }
      });
   },
   getOfferProducts: () => {
      return new Promise(async (resolve, reject) => {
         try {
            response = {};
            let offerProducts = await db
               .get()
               .collection(collection.PRODUCTS_COLLECTION)
               .find({ Hasoffer: true })
               .toArray();
            if (offerProducts.length != 0) {
               let offerrate;
               offerProducts.forEach((each) => (each.Hasoffer == true ? (offerrate = each.Offerrate) : (offerrate = 0)));
               response.products = offerProducts;
               response.rate = offerrate;
               resolve(response);
            } else {
               let offerrate = parseInt(productOfferRate);

               response.products = offerProducts;
               response.rate = offerrate;
               resolve(response);
            }
         } catch (error) {
            reject(error);
         }
      });
   },
   deleteOfferProduct: ({ prodId }) => {
      return new Promise((resolve, reject) => {
         try {
            db.get()
               .collection(collection.PRODUCTS_COLLECTION)
               .updateOne({ _id: ObjectId(prodId) }, { $set: { Hasoffer: false, Offerrate: 0 } });
            resolve();
         } catch (error) {
            reject(error);
         }
      });
   },
   changeDiscountRate: ({ discountrate }) => {
      return new Promise(async (resolve, reject) => {
         try {
            productOfferRate = parseInt(discountrate);
            db.get()
               .collection(collection.OFFER_COLLECTION)
               .updateOne({ _id: ObjectId("635beb29a90ec5581cb37df8") }, { $set: { Offerrate: parseInt(discountrate) } });
            let offerproductexist = await db
               .get()
               .collection(collection.PRODUCTS_COLLECTION)
               .find({ Hasoffer: true })
               .toArray();
            if (offerproductexist != 0) {
               offerproductexist.forEach((product) => {
                  db.get()
                     .collection(collection.PRODUCTS_COLLECTION)
                     .updateOne(
                        { _id: ObjectId(product._id) },
                        {
                           $set: {
                              Offerrate: productOfferRate,
                              Offerprice: product.Price - product.Price * (productOfferRate / 100),
                           },
                        }
                     );
               });
            }
            resolve();
         } catch (error) {
            reject(error);
         }
      });
   },

   addAmountToWallet: ({ userId, quantity, price, productCount, deductedAmount }) => {
      //On return items

      return new Promise(async (resolve, reject) => {
         try {
            let walletObj = {
               user: ObjectId(userId),
               Balance: (parseInt(price) * parseInt(quantity))-(parseInt(deductedAmount)/parseInt(productCount)),
            };

            let walletExist = await db
               .get()
               .collection(collection.WALLET_COLLECTION)
               .findOne({ user: ObjectId(userId) });
            if (walletExist != null) {
               let currentBalance = walletExist.Balance;
               let date = new Date();
               let day = date.getDate();
               let month = date.getMonth() + 1;
               let year = date.getFullYear();
               let currentDate = `${day}-${month}-${year}`;
               var hour = date.getHours();
               hour = (hour < 10 ? "0" : "") + hour;
               var min = date.getMinutes();
               min = (min < 10 ? "0" : "") + min;
               var sec = date.getSeconds();
               sec = (sec < 10 ? "0" : "") + sec;
               let currentTime = `${hour}:${min}:${sec}`;
               let newBalance = parseInt(currentBalance) + ((parseInt(quantity) * parseInt(price))-(parseInt(deductedAmount)/parseInt(productCount)));

               let transactionObj = {
                  date: currentDate,
                  time: currentTime,
                  oldbalance: currentBalance,
                  credit: ((parseInt(quantity) * parseInt(price))-(parseInt(deductedAmount)/parseInt(productCount))),
                  debit: 0,
                  newbalance: newBalance,
               };
               db.get()
                  .collection(collection.WALLET_COLLECTION)
                  .updateOne(
                     { user: ObjectId(userId) },
                     { $set: { Balance: parseInt(newBalance) }, $push: { transactions: transactionObj } }
                  );
               resolve();
            } else {
               db.get().collection(collection.WALLET_COLLECTION).insertOne(walletObj);
               resolve();
            }
         } catch (error) {
            reject();
         }
      });
   },
   getWallet: (userId) => {
      return new Promise(async (resolve, reject) => {
         try {
            let wallet = await db
               .get()
               .collection(collection.WALLET_COLLECTION)
               .findOne({ user: ObjectId(userId) });
            resolve(wallet);
         } catch (error) {
            errorWallet = {
               Balance: 0,
               transactions: [],
            };
            reject(errorWallet);
         }
      });
   },

   addtowishlist: (prodId, userId) => {
      return new Promise(async (resolve, reject) => {
         try {
            response = {};

            let product = await db
               .get()
               .collection(collection.PRODUCTS_COLLECTION)
               .findOne({ _id: ObjectId(prodId) });
            let wishlistObj = {
               user: ObjectId(userId),
               products: [product._id],
            };
            let wishlistExist = await db
               .get()
               .collection(collection.WISHLIST_COLLECTION)
               .count({ user: ObjectId(userId) });

            if (parseInt(wishlistExist) != 0) {
               let prod = await db
                  .get()
                  .collection(collection.WISHLIST_COLLECTION)
                  .findOne({ user: ObjectId(userId) });
               let arr = prod.products;
               count = arr.findIndex((a) => a == prodId);

               if (count != -1) {
                  response.status = false;
                  response.message = "This item already exists in wishlist";
                  resolve(response);
               } else {
                  db.get()
                     .collection(collection.WISHLIST_COLLECTION)
                     .updateOne({ user: ObjectId(userId) }, { $push: { products: ObjectId(product._id) } });
                  response.status = true;
                  response.message = "";
                  resolve(response);
               }
            } else {
               db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishlistObj);
               response.status = true;
               response.message = "";
               resolve(response);
            }
         } catch (error) {
            reject(error);
         }
      });
   },
   deleteFromWishlist: ({ prodId }, userId) => {
      return new Promise((resolve, reject) => {
         try {
            db.get()
               .collection(collection.WISHLIST_COLLECTION)
               .updateOne({ user: ObjectId(userId) }, { $pull: { products: ObjectId(prodId) } })
               .then((data) => {
                  resolve({ status: true });
               });
         } catch (error) {
            reject(error);
         }
      });
   },
   getWishList: () => {
      return new Promise(async (resolve, reject) => {
         try {
            let wishlistProducts = await db
               .get()
               .collection(collection.WISHLIST_COLLECTION)
               .aggregate([
                  {
                     $unwind: "$products",
                  },
                  {
                     $lookup: {
                        from: collection.PRODUCTS_COLLECTION,
                        localField: "products",
                        foreignField: "_id",
                        as: "prodDetails",
                     },
                  },
                  {
                     $project: {
                        user: 1,
                        prodDetails: { $arrayElemAt: ["$prodDetails", 0] },
                     },
                  },
               ])
               .toArray();

            resolve(wishlistProducts);
         } catch (error) {
            reject(error);
         }
      });
   },

   createCoupon: ({ coupon, offerper }) => {
      return new Promise((resolve, reject) => {
         try {
            let couponObj = {
               coupon: coupon,
               offerpercentage: parseInt(offerper),
               users: [],
            };
            db.get()
               .collection(collection.COUPON_COLLECTION)
               .insertOne(couponObj)
               .then((data) => {
                  resolve(data);
               });
         } catch (error) {
            reject(error);
         }
      });
   },
   getAllCoupons: () => {
      return new Promise(async (resolve, reject) => {
         try {
            allCoupons = await db.get().collection(collection.COUPON_COLLECTION).find().toArray();
            resolve(allCoupons);
         } catch (error) {
            reject(error);
         }
      });
   },
   getOneCoupon: ({ couponId }) => {
      return new Promise(async (resolve, reject) => {
         try {
            onecoupon = await db
               .get()
               .collection(collection.COUPON_COLLECTION)
               .findOne({ _id: ObjectId(couponId) });
            resolve(onecoupon);
         } catch (error) {
            reject(error);
         }
      });
   },
   editCoupons: ({ couponId, coupon, offerper }) => {
      offerper = parseInt(offerper);
      return new Promise((resolve, reject) => {
         try {
            db.get()
               .collection(collection.COUPON_COLLECTION)
               .updateOne({ _id: ObjectId(couponId) }, { $set: { coupon: coupon, offerpercentage: offerper } });
            resolve();
         } catch (error) {
            reject(error);
         }
      });
   },
   deleteCoupons: ({ couponId }) => {
      return new Promise((resolve, reject) => {
         try {
            db.get()
               .collection(collection.COUPON_COLLECTION)
               .deleteOne({ _id: ObjectId(couponId) });
            resolve();
         } catch (error) {
            reject(error);
         }
      });
   },
   checkCoupon: ({ coupon }, userId) => {
      return new Promise(async (resolve, reject) => {
         try {
            response = {};
            let couponExist = await db.get().collection(collection.COUPON_COLLECTION).find({ coupon: coupon }).toArray();

            let exist = couponExist.findIndex((index) => index.coupon == coupon);

            if (exist != -1) {
               let userAlreadyUsed = await db
                  .get()
                  .collection(collection.COUPON_COLLECTION)
                  .count({ coupon: coupon, users: { $in: [ObjectId(userId)] } });
               if (userAlreadyUsed != 0) {
                  response.status = false;
                  response.percentage = 0;
                  response.coupon = "";
                  response.message = "Coupon is already availed";
                  resolve(response);
               } else {
                  response.status = true;
                  response.percentage = couponExist[0].offerpercentage;
                  response.coupon = couponExist[0].coupon;
                  response.message = "Coupon Applied";
                  
                  resolve(response);
               }
            } else {
               response.coupon = "";
               (response.status = false), (response.percentage = 0);
               response.message = "Invalid coupon";
               resolve(response);
            }
         } catch (error) {
            reject(error);
         }
      });
   },
   getCoupons: () => {
      return new Promise(async (resolve, reject) => {
         try {
            let coupons = await db.get().collection(collection.COUPON_COLLECTION).find().toArray();
            resolve(coupons);
         } catch (error) {
            reject(error);
         }
      });
   },

   assignOfferRate: () => {
      //this is to assign the current offer rate to the products
      return new Promise(async (resolve, reject) => {
         try {
            let offerRate = await db.get().collection(collection.OFFER_COLLECTION).find().toArray();
            productOfferRate = parseInt(offerRate[0].Offerrate);
            resolve();
         } catch (error) {
            reject(error);
         }
      });
   },

   changePassworForForgotPassword: ({ password, user }) => {
      return new Promise(async (resolve, reject) => {
         try {
            password = await bcrypt.hash(password, 10);
            db.get()
               .collection(collection.USER_COLLECTION)
               .updateOne({ _id: ObjectId(user) }, { $set: { password: password } })
               .then(() => {
                  resolve();
               });
         } catch (error) {
            reject();
         }
      });
   },

   applyFilters: ({ min, max }, cartId) => {
      return new Promise(async (resolve, reject) => {
         try {
            let filteredProducts = await db
               .get()
               .collection(collection.PRODUCTS_COLLECTION)
               .find({
                  $and: [
                     { Genre: ObjectId(cartId) },
                     { Offerprice: { $gt: parseInt(min) } },
                     { Offerprice: { $lt: parseInt(max) } },
                  ],
               })
               .toArray();
            
            resolve(filteredProducts);
         } catch (error) {
            reject();
         }
      });
   },
};
