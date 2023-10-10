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
adminRoute.post('/adminLogin', adminController.adminLogin)
adminRoute.get('/dashboard', auth.isLogin, adminController.loadAdmin)

//=============================ADMIN LOGOUT=================================================
adminRoute.get('/logout', auth.isLogin , adminController.adminLogout)

//===================================USER MANAGEMENT========================================
adminRoute.get('/userDetails', auth.isLogin, adminController.usersList)
adminRoute.get('/block-user', auth.isLogin, adminController.blockUser)

//--------------------------------------CATEGORY CONTROLLING-------------------------------------------------------------------------------------

//================================CATEGORY MANAGEMENT=======================================
adminRoute.get('/addCategory', auth.isLogin, adminController.loadAddcategory)
adminRoute.post('/addCate', adminController.addCate)
adminRoute.get('/block-cat', auth.isLogin, adminController.blockCat)
adminRoute.get('/category', auth.isLogin, adminController.category)
//=============================LOAD EDIT CATEGORY PAGE======================================
adminRoute.get('/edit-cat', auth.isLogin, adminController.editCate)
//=======================UPDATING CATEGORY AND RELOAD THE PAGE==============================
adminRoute.post('/editCate', adminController.updateCate)

//----------------------------------------PRODUCT CONTROLLING-------------------------------------------------------------------------------------

//==========================PRODUCT MANAGEMENT==============================================
adminRoute.get('/addProduct', auth.isLogin,productController.loadAddProduct)
adminRoute.get('/product',auth.isLogin,productController.product)
adminRoute.post('/addProduct', multer.productImagesUpload, productController.addProduct)

//===========================PRODUCT BLOCK AND UNBLOCK======================================
adminRoute.get('/block-pro',auth.isLogin , productController.blockProduct)
//=============================PRODUCT EDIT PAGE============================================
adminRoute.get('/edit-pro-page', auth.isLogin, productController.editProductPage)
//===============================UPDATING PRODUCT===========================================
adminRoute.post('/editProduct', auth.isLogin, multer.productImagesUpload, productController.editedProduct)

//---------------------------------------------ORDER CONTROLLING------------------------------------------------------------------------------------

//====================================ORDER MANAGEMENT=======================================
adminRoute.get('/showOrder', auth.isLogin, orderController.showOrder)
adminRoute.get('/orderFullDetails',orderController.loadProductdetails)
adminRoute.get('/delivered', orderController.delivered)

//---------------------------------------------BANNER CONTROLLING------------------------------------------------------------------------------------

//=================================BANNER MANAGEMENT=========================================
adminRoute.get('/bannerDetails', bannerController.loadBannerPage)
adminRoute.get('/loadAddBanner', bannerController.loadAddBanner)
adminRoute.post('/addBanner', multer.bannerUpload.single('image'), bannerController.addBanner )
adminRoute.get('/block-banner', bannerController.blockBanner)
adminRoute.get('/edit-banner-page', bannerController.editBannerPage)
adminRoute.post('/editBanner', multer.bannerUpload.single('image'), bannerController.editBanner)

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