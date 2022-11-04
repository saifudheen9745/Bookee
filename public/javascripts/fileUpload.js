const multer= require('multer')

// handle storage using multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/productImages')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now()+ "-" +file.originalname)
    }
});
 const upload = multer({ storage: storage });


 const storage2 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/categoryImages')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now()+ "-" +file.originalname)
    }
});
 const upload2 = multer({ storage: storage2 });



 module.exports= {
    upload,
    upload2
};