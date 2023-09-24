const express = require('express')
const userRoute = express()
const bodyParser = require('body-parser')
const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const session = require('express-session')
const config = require('../config/config')
const auth = require('../middlewares/userAuth')
const addressController = require('../controllers/addressController')


//Session setting
userRoute.use(session({
    resave: true,
    saveUninitialized: true,
    secret:config.sessionSecret
  }));

//Body Parser
userRoute.use(bodyParser.json());
userRoute.use(bodyParser.urlencoded({extended:true}))

//setting view engine
userRoute.set('view engine','ejs');
userRoute.set('views','./views/user')

//load home
userRoute.get('/', auth.isLogout, userController.loadHome)
userRoute.get('/home', auth.isLogin, userController.loadHome)

//user register
userRoute.get('/register', auth.isLogout, userController.loadRegister)
userRoute.post('/register', userController.insertUser)

//forget password
userRoute.get('/forget',  userController.forgetLoad)
userRoute.post('/forget',  userController.forgetPassMail)
userRoute.get('/reset_password', userController.loadResetPass)
userRoute.post('/newPass',  userController.newPass)

//user otp verifying
userRoute.get('/otpPage', auth.isLogout , userController.otpPage)
userRoute.post('/varifyOtp', auth.isLogout, userController.verifyOtp)
//resend otp
userRoute.get('/resendOtp', auth.isLogout, userController.resendOtp)

//user login
userRoute.get('/loadLogin', auth.isLogout, userController.loadLogin)
userRoute.post('/login', auth.isLogout, userController.loginUser)

//user logout
userRoute.get('/logout', auth.isLogin, userController.userLogout)


//product view
userRoute.get('/productView', productController.productView)

//user Profile
userRoute.get('/profile', auth.isLogin, userController.showProfile)
userRoute.post('/add_address', auth.isLogin, addressController.addAddress)






module.exports = userRoute;