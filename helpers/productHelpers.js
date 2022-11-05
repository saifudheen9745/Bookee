var db = require("../config/connection");
var { ObjectId } = require("mongodb");
var collection = require("../config/collections");



module.exports = {
   addProduct: (prodDetails) => {
      console.log(prodDetails);
      prodDetails.Time = new Date()
      if(prodDetails.Genre != ''){
         console.log('asfdasdf');
         prodDetails.Genre = ObjectId(prodDetails.Genre) 
      }
      
      return new Promise((resolve, reject) => {
         try {
            db.get()
            .collection(collection.PRODUCTS_COLLECTION)
            .insertOne(prodDetails)
            .then((data) => {
               resolve(data.insertedId.toString());
            });   
         } catch (error) {
            console.log('uuuuuuuuuuuuuuuuuu');
            reject(error)
         }
         
      });
   },
   getProductUsers:() => { //Product listing for user side
      return new Promise(async (resolve, reject) => {
         try {
            let products = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate([
               {
                  $lookup:{
                     from:collection.CATEGORY_COLLECTION,
                     localField:'Genre',
                     foreignField:'_id',
                     as:'genrename'
                  }
               },
               {
                  $project:{
                     _id:1,
                     Book:1,
                     Price:1,
                     Author:1,
                     Genre:1,
                     Publisher:1,
                     Description:1,
                     Quantity:1,
                     Hasoffer:1,
                     img:1,
                     Genrename:{$arrayElemAt:['$genrename',0]}
                  }
               },
               {
                  $match:{
                     Hasoffer:{$ne:true}
                  }
               },
               {
                  $sort:{
                     Time:-1
                  }
               },
               {
                  $skip:10 //To skip the first 10 shown in the new arrivals
               }
            ]).toArray()
            //console.log(products);
            resolve(products);
         } catch (error) {
            reject(error)
         }
         
      });
   },
   getProducts: () => { // To Get all products for admin page
      return new Promise(async (resolve, reject) => {
         try {
            let products = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate([
               {
                  $lookup:{
                     from:collection.CATEGORY_COLLECTION,
                     localField:'Genre',
                     foreignField:'_id',
                     as:'genrename'
                  }
               },
               {
                  $project:{
                     _id:1,
                     Book:1,
                     Price:1,
                     Author:1,
                     Genre:1,
                     Publisher:1,
                     Description:1,
                     Quantity:1,
                     Hasoffer:1,
                     img:1,
                     Genrename:{$arrayElemAt:['$genrename',0]}
                  }
               }
            ]).toArray()
            resolve(products);
         } catch (error) {
            reject(error)
         }
         
      });
   },
   getOneProduct: (prodDetails) => { // To get the details of a specific product for both admin an user
      prodDetails = ObjectId(prodDetails);
      return new Promise(async (resolve, reject) => {
         try {
            let product = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate([
               {
                  $match:{
                     _id:prodDetails
                  }
               },
               {
                  $lookup:{
                     from:collection.CATEGORY_COLLECTION,
                     localField:'Genre',
                     foreignField:'_id',
                     as:'Genrename'
                  }
               },
               {
                  $project:{
                     _id:1,
                     Book:1,
                     Price:1,
                     Author:1,
                     Genre:1,
                     Publisher:1,
                     Description:1,
                     Quantity:1,
                     img:1,
                     Genrename:{$arrayElemAt:['$Genrename',0]}
                  }
               }
            ]).toArray()
            resolve(product);   
         } catch (error) {
            reject(error)
         }
         
      });
   },
   updateProduct: (prodDetails) => { //to update product details
      prodDetails.id = ObjectId(prodDetails.id);
      return new Promise((resolve, reject) => {
         try {
            if(prodDetails.img){
               db.get()
               .collection(collection.PRODUCTS_COLLECTION)
               .updateOne(
                  { _id: prodDetails.id },
                  {
                     $set: {
                        Book: prodDetails.Book,
                        Price: prodDetails.Price,
                        Author: prodDetails.Author,
                        Genre: ObjectId(prodDetails.Genre),
                        Quantity:prodDetails.Quantity,
                        Publisher: prodDetails.Publisher,
                        Description: prodDetails.Description,   
                        img:prodDetails.img
                     },
                  }
               )
               .then((data) => {
                  resolve(data);
               });   
            }else{
               console.log('success');
               db.get()
               .collection(collection.PRODUCTS_COLLECTION)
               .updateOne(
                  { _id: prodDetails.id },
                  {
                     $set: {
                        Book: prodDetails.Book,
                        Price: prodDetails.Price,
                        Author: prodDetails.Author,
                        Genre: ObjectId(prodDetails.Genre),
                        Quantity:prodDetails.Quantity,
                        Publisher: prodDetails.Publisher,
                        Description: prodDetails.Description,   
                     },
                  }
                  )
                  .then((data) => {
                     resolve(data);
                  });
               }
         } catch (error) {
            reject(error)
         }
         
      });
   },
   deleteProduct: (prodDetails) => {  //delete product for admin
      prodDetails = ObjectId(prodDetails);
      return new Promise((resolve, reject) => {
         try {
            db.get()
            .collection(collection.PRODUCTS_COLLECTION)
            .deleteOne({ _id: prodDetails })
            .then((data) => {
               resolve(data);
            });   
         } catch (error) {
            reject(error)
         }
         
      });
   },


   addCategory:(categoryData)=>{
      return new Promise((resolve,reject)=>{
         try {
            db.get().collection(collection.CATEGORY_COLLECTION).insertOne(categoryData).then((data)=>{
               resolve(data.insertedId.toString());
            })   
         } catch (error) {
            reject(error)
         }
         
      })
   },
   getCategories:()=>{
      return new Promise(async(resolve,reject)=>{
         try {
            let categories = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(categories)      
         } catch (error) {
            reject()
         }
      
      })
   },
   getOneCategory:(genre)=>{
      
      return new Promise(async(resolve,reject)=>{
        try {
         let category =await db.get().collection(collection.PRODUCTS_COLLECTION).find({Genre:ObjectId(genre)}).toArray()
         console.log(category);
         resolve(category)
        } catch (error) {
         reject(error)
        }
         

      })
   },
   getCategoryDetails:(id)=>{
      id = ObjectId(id)
      return new Promise(async(resolve,reject)=>{
         try {
            category = await db.get().collection(collection.CATEGORY_COLLECTION).find(id).toArray()
         resolve(category)   
         } catch (error) {
            reject(error)
         }
         
      })
   },
   editCategory:(categoryDetails)=>{
      let response={
         editStatus:true
      }
      categoryDetails.id = ObjectId(categoryDetails.id)
      return new Promise(async(resolve,reject)=>{
         try {
            categoryOldName = await db.get().collection(collection.CATEGORY_COLLECTION).find({_id:categoryDetails.id}).toArray()
         console.log(categoryOldName);
         let count = await db.get().collection(collection.CATEGORY_COLLECTION).count({$and:[{Name:categoryDetails.Name},{_id:{$ne:categoryDetails.id}}]})
         if (count != 0) {
            response.editStatus = false
            response.message = "Another category with same name already exists"
            resolve(response)
         } else {
            if (categoryDetails.img) {
               category = await db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:categoryDetails.id},{$set:{Name:categoryDetails.Name,img:categoryDetails.img}})
               response.data = category
               resolve(response)   
            }else{
               category = await db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:categoryDetails.id},{$set:{Name:categoryDetails.Name}})
               response.data = category
               resolve(response)
            }
            
         }
         } catch (error) {
            reject()
         }
         
         
      })
   },
   deleteCategoryAndProductsWithin:({catId})=>{
      return new Promise(async(resolve,reject)=>{
         let category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:ObjectId(catId)})
         let categoryImg = category.img
         let productsImg = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate([
            {
               $match:{
                  Genre:ObjectId(catId)
               }
            },
            {
               $group:{
                  _id:0,
                  img:{'$push':'$img'}
               }
            },
            {
               $project: {
                   img: {
                       "$reduce": {
                           "input": "$img",
                           "initialValue": [],
                           "in": { "$setUnion": ["$$value", "$$this"] }
                       }
                   }
               }
           }
         ]).toArray().then((productsImg)=>{
            
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:ObjectId(catId)}).then(()=>{
               db.get().collection(collection.PRODUCTS_COLLECTION).deleteMany({Genre:ObjectId(catId)}).then(()=>{
                  response={
                     categoryImage:categoryImg,
                     productsImg:productsImg
                  }
                  resolve(response)
               })
            })
         })

         
      })
   },
   deleteCategory:({catId})=>{
      return new Promise((resolve,reject)=>{
         db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:ObjectId(catId)}).then((data)=>{
            let categoryImg = data.img
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:ObjectId(catId)}).then(()=>{
               resolve(categoryImg)
            })
         })
      })
   },
   getNewArrivals:()=>{
      return new Promise(async(resolve,reject)=>{
         try {
            let newarrivals =await db.get().collection(collection.PRODUCTS_COLLECTION).find({}).sort({Time:-1}).limit(10).toArray()
         resolve(newarrivals);
         } catch (error) {
            reject()
         }
         
      })
   },
   addProductQuantity:(prodId,prodQty)=>{
      return new Promise((resolve,reject)=>{
         try {
            db.get().collection(collection.PRODUCTS_COLLECTION).updateOne({_id:ObjectId(prodId)},{$set:{Quantity:parseInt(prodQty)}})
            resolve()   
         } catch (error) {
            reject(error)
         }
         
      })
   },
   searchProducts:(key)=>{
      return new Promise(async(resolve,reject)=>{
         try {
            let products = await db.get().collection(collection.PRODUCTS_COLLECTION).find({Book:{$regex: "(?i)"+key.searchkey }}).toArray()
            console.log(products);
            resolve(products)    
         } catch (error) {
            reject(error)
         }
        
      })
   }
};
