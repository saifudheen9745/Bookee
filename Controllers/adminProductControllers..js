let productHelpers = require('../helpers/productHelpers')
let userHelpers = require('../helpers/userHelpers')
let db = require("../config/connection");
let { ObjectId } = require("mongodb");
let collection = require("../config/collections");


module.exports.adminGetAllProducts = async (req, res, next) => {
    try {
       productHelpers
          .getProducts()
          .then((products) => {
             res.render("Admin/products", { admin: true, products });
          })
          .catch((error) => {
             res.redirect("/admin/error");
          });
    } catch (error) {
       res.redirect("/admin/error");
    }
 }

 module.exports.adminAddProductQuantity = async (req, res, next) => {
    try {
       productHelpers
          .addProductQuantity(req.body.prodId, req.body.prQnty)
          .then(() => {
             res.redirect("/admin/products");
          })
          .catch((error) => {
             res.redirect("/admin/error");
          });
    } catch (error) {
       res.redirect("/admin/error");
    }
 }

 module.exports.adminAddProducts =  async (req, res, next) => {
    try {
       productHelpers
          .getCategories()
          .then((data) => {
             res.render("Admin/add-product", { admin: true, data });
          })
          .catch((error) => {
             res.redirect("/admin/error");
          });
    } catch (error) {
       res.redirect("/admin/error");
    }
 }

 module.exports.adminAddProductPost = async (req, res, next) => {
    try {
       let imageFiles = req.files;
       const fileName = imageFiles.map((file) => {
          return file.filename;
       });
 
       prodDetails = {
          Book: req.body.Book,
          Price: parseInt(req.body.Price),
          Author: req.body.Author,
          Genre: req.body.Genre,
          Quantity: parseInt(req.body.Quantity),
          Publisher: req.body.Publisher,
          Description: req.body.Description,
          Hasoffer: false,
          Offerrate: 0,
          Offerprice: parseInt(req.body.Price),
          img: fileName,
       };
       productHelpers
          .addProduct(prodDetails)
          .then((data) => {
             res.redirect("/admin/products");
          })
          .catch((error) => {
             res.redirect("/admin/error");
          });
    } catch (error) {
       res.redirect("/admin/error");
    }
 }

 module.exports.adminGetOneProductDetailsToEdit = async (req, res, next) => {
    try {
       productHelpers
          .getOneProduct(req.params.id)
          .then((product) => {
             productHelpers
                .getCategories()
                .then((data) => {
                   res.render("Admin/edit-product", { admin: true, product: product[0], data });
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

 module.exports.adminEditProductPost = async (req, res, next) => {
    try {
       let fileName;
       if (req.files != 0) {
          let imageFiles = req.files;
          fileName = imageFiles.map((file) => {
             return file.filename;
          });
       } else {
          fileName = false;
       }
       prodDetails = {
          id: req.params.id,
          Book: req.body.Book,
          Price: parseInt(req.body.Price),
          Author: req.body.Author,
          Genre: req.body.Genre,
          Quantity: parseInt(req.body.Quantity),
          Publisher: req.body.Publisher,
          Description: req.body.Description,
          img: fileName,
       };
 
       productHelpers
          .updateProduct(prodDetails)
          .then((data) => {
             res.redirect("/admin/products");
          })
          .catch((error) => {});
    } catch (error) {
       res.redirect("/admin/error");
    }
 }

 module.exports.adminDeleteProduct = async (req, res, next) => {
    try {
       productHelpers
          .deleteProduct(req.params.id)
          .then((data) => {
             res.redirect("/admin/products");
          })
          .catch((error) => {
             res.redirect("/admin/error");
          });
    } catch (error) {
       res.redirect("/admin/error");
    }
 }

 module.exports.adminProductOfferManagementPage = async (req, res, next) => {
    try {
       userHelpers
          .assignOfferRate()
          .then(() => {
             userHelpers
                .getOfferProducts()
                .then((response) => {
                   proCount = response.products.length;
                   res.render("Admin/productoffer-management", {
                      admin: true,
                      offerproducts: response.products,
                      proCount,
                      rate: response.rate,
                   });
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

 module.exports.adminAddProductToOffer = async (req, res, next) => {
    try {
       userHelpers
          .addProductOffer(req.body)
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

 module.exports.adminDeleteProductFromOffer = async (req, res, next) => {
    try {
       userHelpers
          .deleteOfferProduct(req.body)
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

 module.exports.adminChangeDiscountRate = async (req, res, next) => {
    try {
       userHelpers
          .changeDiscountRate(req.body)
          .then((data) => {
             res.redirect("/admin/productoffer-management");
          })
          .catch((error) => {
             res.redirect("/admin/error");
          });
    } catch (error) {
       res.redirect("/admin/error");
    }
 }