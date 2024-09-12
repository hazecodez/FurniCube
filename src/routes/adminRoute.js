const express = require('express')
const adminRoute = express()
const adminController = require('../controllers/adminController')
const productController =require('../controllers/productController')
const path = require('path')
const session = require('express-session')
const auth = require('../middlewares/adminAuth')
const config = require('../config/config')
const multer =  require('../middlewares/multer')
const orderController = require('../controllers/orderController')
const bannerController = require('../controllers/bannerController')
const couponController = require('../controllers/couponController')

//===========================SESSION SETTING================================================
adminRoute.use(session({
    resave: true,
    saveUninitialized: true,
    secret:config.sessionSecret
  }));
//===========================BODY PARSING===================================================
adminRoute.use(express.json())
adminRoute.use(express.urlencoded({extended:true}))

//==============================SETTING VIEW ENGINE=========================================
adminRoute.set('view engine', 'ejs');
adminRoute.set('views','./views/admin')

//===================================ADMIN LOGIN AND HOME PAGE==============================

adminRoute.get('/', auth.isLogout,adminController.loadLogin)
adminRoute.get('/home', auth.isLogin,adminController.loadAdmin)
adminRoute.post('/adminLogin', auth.isLogout, adminController.adminLogin)

//=============================ADMIN LOGOUT=================================================
adminRoute.get('/logout', auth.isLogin , adminController.adminLogout)

//===================================USER MANAGEMENT========================================
adminRoute.get('/userDetails', auth.isLogin, adminController.usersList)
adminRoute.get('/block-user', auth.isLogin, adminController.blockUser)

//--------------------------------------SALES REPORT AND DASHBOARD--------------------------------------------------------------------------------
//===============================SALES REPORT WITH YEARLY MONTHLY FILTER====================
adminRoute.get('/dashboard', auth.isLogin, adminController.loadAdmin)
adminRoute.get('/salesReport', auth.isLogin, adminController.salesReport)
adminRoute.get('/saleSortPage/:id', auth.isLogin, adminController.saleSorting)
adminRoute.get('/reportDown', auth.isLogin, adminController.downloadReport)

//--------------------------------------CATEGORY CONTROLLING-------------------------------------------------------------------------------------

//================================CATEGORY MANAGEMENT=======================================
adminRoute.get('/addCategory', auth.isLogin, adminController.loadAddcategory)
adminRoute.post('/addCate', auth.isLogin, adminController.addCate)
adminRoute.get('/block-cat', auth.isLogin, adminController.blockCat)
adminRoute.get('/category', auth.isLogin, adminController.category)
//=============================LOAD EDIT CATEGORY PAGE======================================
adminRoute.get('/edit-cat', auth.isLogin, adminController.editCate)
//=======================UPDATING CATEGORY AND RELOAD THE PAGE==============================
adminRoute.post('/editCate', auth.isLogin, adminController.updateCate)

//----------------------------------------PRODUCT CONTROLLING-------------------------------------------------------------------------------------

//==========================PRODUCT MANAGEMENT==============================================
adminRoute.get('/addProduct', auth.isLogin,productController.loadAddProduct)
adminRoute.get('/product',auth.isLogin,productController.product)
adminRoute.post('/addProduct', auth.isLogin, multer.productImagesUpload, productController.addProduct)

//===========================PRODUCT BLOCK AND UNBLOCK======================================
adminRoute.get('/block-pro',auth.isLogin , productController.blockProduct)
//=============================PRODUCT EDIT PAGE============================================
adminRoute.get('/edit-pro-page', auth.isLogin, productController.editProductPage)
//===============================UPDATING PRODUCT===========================================
adminRoute.post('/editProduct', auth.isLogin, multer.productImagesUpload, productController.editedProduct)

//---------------------------------------------ORDER CONTROLLING------------------------------------------------------------------------------------

//====================================ORDER MANAGEMENT=======================================
adminRoute.get('/showOrder', auth.isLogin, orderController.showOrder)
adminRoute.get('/orderFullDetails', auth.isLogin, orderController.loadProductdetails)
adminRoute.get('/statusUpdate', auth.isLogin, orderController.statusUpdate)
adminRoute.get('/user-order', auth.isLogin, orderController.eachUserOrder)

//---------------------------------------------BANNER CONTROLLING------------------------------------------------------------------------------------

//=================================BANNER MANAGEMENT=========================================
adminRoute.get('/bannerDetails', auth.isLogin, bannerController.loadBannerPage)
adminRoute.get('/loadAddBanner', auth.isLogin, bannerController.loadAddBanner)
adminRoute.post('/addBanner', auth.isLogin,  multer.bannerUpload.single('image'), bannerController.addBanner )
adminRoute.get('/block-banner', auth.isLogin, bannerController.blockBanner)
adminRoute.get('/edit-banner-page', auth.isLogin, bannerController.editBannerPage)
adminRoute.post('/editBanner', auth.isLogin, multer.bannerUpload.single('image'), bannerController.editBanner)

//-------------------------------------------COUPON CONTROLLING---------------------------------------------------------------------------------------
adminRoute.get('/showCoupon', auth.isLogin, couponController.showCoupons)
adminRoute.get('/addCoupon', auth.isLogin, couponController.addCouponPage)
adminRoute.post('/addCoupon', auth.isLogin, couponController.addCoupon)
adminRoute.get('/block-coupons', auth.isLogin, couponController.blockCoupons)
adminRoute.get('/edit-coupon-page', auth.isLogin, couponController.showEditPage)
adminRoute.post('/editCoupon', auth.isLogin, couponController.updateCoupon)

//==================================404 ERROR PAGE===========================================
adminRoute.get('*', adminController.loadError)


module.exports= adminRoute;