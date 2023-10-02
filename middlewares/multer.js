const  multer = require('multer')
const path = require('path')

// const storage = multer.diskStorage({
//   destination: "public/product/",
//   filename: (req, file, cb)=> {

//     const filename = file.originalname;

//     cb(null, filename)

//   }

// })

// const upload = multer({ storage: storage})

// module.exports = {upload}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/products/images"));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });
const productImagesUpload = upload.fields([
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount: 1 },
  { name: "image4", maxCount: 1 },
]);

module.exports = { productImagesUpload}