let productHelpers = require('../helpers/productHelpers')
let userHelpers = require('../helpers/userHelpers')
let db = require("../config/connection");
let { ObjectId } = require("mongodb");
let collection = require("../config/collections");


module.exports.adminGetAllCategories =  async (req, res, next) => {
    try {
       productHelpers
          .getCategories()
          .then((data) => {
             res.render("Admin/categories", { admin: true, data });
          })
          .catch((error) => {
             res.redirect("/admin/error");
          });
    } catch (error) {
       res.redirect("/admin/error");
    }
 }

 module.exports.adminAddCategory = async (req, res, next) => {
    try {
       res.render("Admin/add-category", { admin: true });
    } catch (error) {
       res.redirect("/admin/error");
    }
 }

 module.exports.adminAddCategoryPost = async (req, res, next) => {
    try {
       let imgfile = req.files[0].filename;
 
       categoryData = {
          CategoryId: req.body.CategoryId,
          Name: req.body.Name,
          img: imgfile,
       };
       productHelpers
          .addCategory(categoryData)
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

 module.exports.adminGetOneCategoryDetailsToEdit = async (req, res, next) => {
    try {
       productHelpers
          .getCategoryDetails(req.params.id)
          .then((data) => {
             res.render("Admin/edit-category", { admin: true, data, editError });
             editError = "";
          })
          .catch((error) => {
             res.redirect("/admin/error");
          });
    } catch (error) {
       res.redirect("/admin/error");
    }
 }

module.exports.adminEditCategoryPost =async (req, res, next) => {
    try {
       let imgFile = false;
       if (req.files != 0) {
          imgFile = req.files[0].filename;
       }
       categoryDetails = {
          Name: req.body.Name,
          id: req.params.id,
          img: imgFile,
       };
       productHelpers
          .editCategory(categoryDetails)
          .then((data) => {
             res.redirect("/admin/categories");
          })
          .catch((error) => {
             res.redirect("/admin/error");
          });
    } catch (error) {
       res.redirect("/admin/error");
    }
 }

 module.exports.adminDeleteCategory = async (req,res,next)=>{
   if(req.body.productDelete == 'true'){
      productHelpers.deleteCategoryAndProductsWithin(req.body).then((data)=>{
         fs.unlink("public/categoryImages/"+data.categoryImage,function(err){
            
            if(data.productsImg.length != 0){
               data.productsImg[0].img.forEach(element => {
                  fs.unlink("public/productImages/"+element,function(err){
                     if(err) return console.log(err);
                  })
               });
            }
         })
         res.json({withproducts:true})
      })
   }else{
      productHelpers.deleteCategory(req.body).then((data)=>{
         fs.unlink("public/categoryImages/"+data,function(err){
            if(err) return console.log(err);
            res.json({withproducts:false})
         })
      })
   }
}