const express = require('express')
const userRoute = express()

const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const session = require('express-session')
const config = require('../config/config')
const auth = require('../middlewares/userAuth')
const stock = require('../middlewares/stockCheck')
const addressController = require('../controllers/addressController')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController')
const couponController = require('../controllers/couponController')
const wishlistController = require('../controllers/wishlistController')

//===============================SESSION SETTING==============================
userRoute.use(session({
    resave: true,
    saveUninitialized: true,
    secret:config.sessionSecret
  }));

//==========================BODY PARSER=======================================
userRoute.use(express.json());
userRoute.use(express.urlencoded({extended:true}))

//==========================SETTING VIEW ENGINE===============================
userRoute.set('view engine','ejs');
userRoute.set('views','./views/user')

//=============================LOAD HOME=====================================
userRoute.get('/', auth.isLogout, userController.loadHome)
userRoute.get('/home', auth.isLogin, userController.loadHome)
userRoute.get('/aboutUs', userController.showAbout)
userRoute.get('/contactUs', userController.showContact)

//=============================USER REGISTER==================================
userRoute.get('/register', auth.isLogout, userController.loadRegister)
userRoute.post('/register', auth.isLogout, userController.insertUser)

//============================FORGET PASSWORD=================================
userRoute.get('/forget',  userController.forgetLoad)
userRoute.post('/forget',  userController.forgetPassMail)
userRoute.get('/reset_password', userController.loadResetPass)
userRoute.post('/newPass',  userController.newPass)

//===========================USER OTP VERIFYING===============================
userRoute.get('/otpPage', auth.isLogout , userController.otpPage)
userRoute.post('/varifyOtp', auth.isLogout, userController.verifyOtp)

//==========================RESEND OTP=========================================
userRoute.get('/resendOtp', auth.isLogout, userController.resendOtp)

//===========================USER LOGIN========================================
userRoute.get('/loadLogin', auth.isLogout, userController.loadLogin)
userRoute.post('/login', auth.isLogout, userController.loginUser)

//============================USER LOGOUT======================================
userRoute.get('/logout', auth.isLogin, userController.userLogout)

//===========================PRODUCT DETAILS===================================
userRoute.get('/productView', productController.productView)

//==============================USER PROFILE===================================
userRoute.get('/profile', auth.isLogin, userController.showProfile)
userRoute.post('/editProfile', auth.isLogin, addressController.editProfile)
userRoute.get('/editAddress', auth.isLogin, addressController.loadEditAddress)
userRoute.post('/changePassword', auth.isLogin, userController.changePassword)
userRoute.get('/editAddressProfile', auth.isLogin, addressController.editAddressProfile)
userRoute.post('/editBillingAddress', auth.isLogin, addressController.editBillingAddress)

//===============================CART HANDLING=================================
userRoute.get('/cart', cartController.showCart)
userRoute.post('/addToCart',  cartController.addToCart)
userRoute.post('/removeCartItem', auth.isLogin, cartController.removeCartItem)
userRoute.post('/cartQuantityUpdation', auth.isLogin, cartController.quantityUpdation)

//================================CHECKOUT HANDLING============================
userRoute.get('/checkOut', auth.isLogin, cartController.loadCheckOut)
userRoute.post('/addBillingAddress', auth.isLogin, addressController.addMultipleAddress)
userRoute.post('/removeAddress', auth.isLogin, addressController.removeAddress)
userRoute.post('/update_address', auth.isLogin, addressController.updateAddress)

//=================================ORDER HANDLING================================
userRoute.post('/placeOrder',auth.isLogin, stock.inStock, orderController.placeOrder)
userRoute.get("/orderSuccess/:id",auth.isLogin,orderController.successPage);
userRoute.get('/orders', orderController.userOrders)
userRoute.get('/viewOrderDetails', auth.isLogin, orderController.userOderDetails)
userRoute.post('/verify-payment', auth.isLogin, orderController.verifyPayment)
userRoute.post('/orderCancel', auth.isLogin, orderController.orderCancel)
userRoute.post('/productReturn', auth.isLogin, orderController.productReturn)
userRoute.get('/invoice/:id', auth.isLogin, orderController.orderInvoice)

//================================WISHLIST HANDLING==============================
userRoute.get('/wishlist', auth.isLogin, wishlistController.showWishlist)
userRoute.post('/addToWishlist', auth.isLogin, wishlistController.addToWishlist)
userRoute.post('/removeWish', auth.isLogin, wishlistController.removeWishItem)

//=====================================SHOP======================================
userRoute.get('/shop', userController.loadShop)

//==================================COUPON HANDLING==============================
userRoute.post('/applyCoupon', auth.isLogin, couponController.applyCoupon)
userRoute.post('/deleteAppliedCoupon', auth.isLogin, couponController.deleteAppliedCoupon)

//==================================404 ERROR====================================
userRoute.get('*',userController.loadError)




module.exports = userRoute;