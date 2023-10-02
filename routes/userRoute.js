const express = require('express')
const userRoute = express()
const bodyParser = require('body-parser')
const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const session = require('express-session')
const config = require('../config/config')
const auth = require('../middlewares/userAuth')
const addressController = require('../controllers/addressController')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController')

//===============================SESSION SETTING==============================
userRoute.use(session({
    resave: true,
    saveUninitialized: true,
    secret:config.sessionSecret
  }));

//==========================BODY PARSER=======================================
userRoute.use(bodyParser.json());
userRoute.use(bodyParser.urlencoded({extended:true}))

//==========================SETTING VIEW ENGINE===============================
userRoute.set('view engine','ejs');
userRoute.set('views','./views/user')

//=============================LOAD HOME=====================================
userRoute.get('/', auth.isLogout, userController.loadHome)
userRoute.get('/home', auth.isLogin, userController.loadHome)

//=============================USER REGISTER==================================
userRoute.get('/register', auth.isLogout, userController.loadRegister)
userRoute.post('/register', userController.insertUser)

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
userRoute.post('/add_address', auth.isLogin, addressController.addAddress)
userRoute.get('/editAddress', auth.isLogin, addressController.loadEditAddress)

//===============================CART HANDLING=================================
userRoute.get('/cart', cartController.showCart)
userRoute.post('/addToCart',  cartController.addToCart)
userRoute.post('/removeCartItem', cartController.removeCartItem)
userRoute.post('/cartQuantityUpdation', cartController.quantityUpdation)

//================================CHECKOUT HANDLING============================
userRoute.get('/checkOut', auth.isLogin, cartController.loadCheckOut)
userRoute.post('/addBillingAddress', auth.isLogin, addressController.addMultipleAddress)
userRoute.post('/removeAddress', auth.isLogin, addressController.removeAddress)
userRoute.post('/update_address', auth.isLogin, addressController.updateAddress)

//=================================ORDER HANDLING================================
userRoute.post('/placeOrder',auth.isLogin, orderController.placeOrder)
userRoute.get("/orderSuccess/:id",auth.isLogin,orderController.successPage);
userRoute.get('/orders', orderController.userOrders)
userRoute.get('/viewOrderDetails', orderController.userOderDetails)
//==================================404 ERROR===================================
userRoute.get('*',userController.loadError)




module.exports = userRoute;