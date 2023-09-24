const express = require('express')
const adminRoute = express()
const bodyParser = require('body-parser')
const adminController = require('../controllers/adminController')
const productController =require('../controllers/productController')
const path = require('path')
const session = require('express-session')
const auth = require('../middlewares/adminAuth')
const config = require('../config/config')
const multer =  require('../middlewares/multer')


//session setting
adminRoute.use(session({
    resave: true,
    saveUninitialized: true,
    secret:config.sessionSecret
  }));

adminRoute.use(bodyParser.json())
adminRoute.use(bodyParser.urlencoded({extended:true}))

//setting view engine
adminRoute.set('view engine', 'ejs');
adminRoute.set('views','./views/admin')

//admin 
adminRoute.get('/', auth.isLogout,adminController.loadLogin)
adminRoute.get('/home', auth.isLogin,adminController.loadAdmin)
adminRoute.post('/adminLogin', adminController.adminLogin)
adminRoute.get('/dashboard', auth.isLogin, adminController.loadAdmin)

//admin Logout
adminRoute.get('/logout', auth.isLogin , adminController.adminLogout)

//user management
adminRoute.get('/userDetails', auth.isLogin, adminController.usersList)
adminRoute.get('/block-user', auth.isLogin, adminController.blockUser)

//category management
adminRoute.get('/addCategory', auth.isLogin, adminController.loadAddcategory)
adminRoute.post('/addCate', adminController.addCate)
adminRoute.get('/block-cat', auth.isLogin, adminController.blockCat)
adminRoute.get('/category', auth.isLogin, adminController.category)
//load edit category page
adminRoute.get('/edit-cat', auth.isLogin, adminController.editCate)
//edit the category and update category page
adminRoute.post('/editCate', adminController.updateCate)

//------------------------------Product Controlling----------------------------------------------

//product management
adminRoute.get('/addProduct', auth.isLogin,productController.loadAddProduct)
adminRoute.get('/product',auth.isLogin,productController.product)
adminRoute.post('/addProduct', multer.upload.array("image",4),productController.addProduct)


//product delete
adminRoute.get('/delete-pro',auth.isLogin , productController.deleteProduct)
//product edit
adminRoute.get('/edit-pro-page', auth.isLogin, productController.editProductPage)
//edit product
adminRoute.post('/editProduct', auth.isLogin, productController.editedProduct)





module.exports= adminRoute;