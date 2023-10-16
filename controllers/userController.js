const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Product = require("../models/productModel");
const dotenv = require("dotenv");
dotenv.config();
const Address = require("../models/addressModel");
const randomstring = require("randomstring");
const Banner = require('../models/bannerModel')
const Coupon = require('../models/couponModel')
const Cart = require('../models/cartModel')
const Wishlist = require('../models/wishlistModel')

//================SETTING EMAIL PASS AND OTP IN GLOBALLY TO ACCESS IN OTP PAGE============

let otp;
let email2;
let nameResend;

//=================================PASSWORD BCRYPTION=====================================

const securePassword = async (password) => {
  try {
    const hashPassword = await bcrypt.hash(password, 10);
    return hashPassword;
  } catch (error) {
    console.error(error.message);
  }
};

//===========================FORGET PASSWORD PAGE LOAD====================================

const forgetLoad = async (req, res) => {
  try {
    
    res.render("forgetPass", { name: req.session.name });
  } catch (error) {
    console.log(error.message);
  }
};

//====================================SEND MAIL FOR RECOVER PASSWORD=======================

const passRecoverVerifyMail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "For Recover Password",
      html:
        "<h2>Dear " +
        name +
        ' ,please click here to <a href="https://localhost:5030/reset_password?token=' +
        token +
        '">Reset</a> your password </h2>',
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent:", info.response);
      }
    });
  } catch (error) {
    console.error(error.message);
  }
};

//=============================SEND MAIL FOR OTP VERIFICATION================================

const sendVerifyEmail = async (name, email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "For OTP verification",
      html:
        "<h3>Dear, " +
        name +
        ",  Use this One Time Password </h3> <h1>" +
        otp +
        "</h1> <h3>  to log in to your FurniCube Account. </h3>",
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent:", info.response);
      }
    });
  } catch (error) {
    console.error(error.message);
  }
};

//============================LOAD REGISTRATION PAGE=====================================

const loadRegister = async (req, res) => {
  try {
    res.render("registration", { name: req.session.name });
  } catch (error) {
    console.error(error.message);
  }
};

//==================================LOAD OTP PAGE=======================================

const otpPage = async (req, res) => {
  try {
    res.render("otp", { name: req.session.name });
  } catch (error) {
    console.error(error.message);
  }
};

//==============================LOAD LOGIN PAGE=========================================

const loadLogin = async (req, res) => {
  try {
    const cart = await Cart.findOne({userId:req.session.user_id})
    if(cart){
      const cartCount = cart.products.length
      res.render("login", { name: req.session.name,cartCount:cartCount });
    }else{
      res.render("login", { name: req.session.name,cartCount:0 });
    }

  } catch (error) {
    console.error(error.message);
  }
};

//===============================LOAD HOME PAGE===========================================

const loadHome = async (req, res) => {
  try {
    const products = await Product.find({ blocked: 0 }).limit(8);
    const banners = await Banner.find({status: true})
    const cart = await Cart.findOne({userId:req.session.user_id})
    const wish = await Wishlist.findOne({user:req.session.user_id})
    let cartCount=0; 
    let wishCount=0;
    if(cart){cartCount = cart.products.length}
    if(wish){wishCount = wish.products.length}

    res.render("home", { name: req.session.name, products: products, banners:banners, cartCount,wishCount })

    
  } catch (error) {
    console.error(error.message);
  }
};

//=============================INSERTING USER REGISTERED DATA=============================

const insertUser = async (req, res) => {
  try {
    //check the email which is already exist
    const checkEmail = await User.findOne({ email: req.body.email });
    if (checkEmail) {
      res.render("registration", {
        name: req.session.name,
        message: "Given Email is already exist, please Log In",
      });
    } else {
      if (req.body.password == req.body.con_password) {
        //checking password and confirm password are same
        const secPassword = await securePassword(req.body.password);
        const user = new User({
          name: req.body.name,
          email: req.body.email,
          number: req.body.number,
          password: secPassword,
        });
        const userData = await user.save();
        if (userData) {
          //otp generation
          const randomNumber = Math.floor(Math.random() * 9000) + 1000;
          otp = randomNumber;
          //calling email verification
          sendVerifyEmail(req.body.name, req.body.email, otp);
          // res.render('registration')

          email2 = req.body.email;
          nameResend = req.body.name;
          res.render("otp", { name: req.session.name });
        } else {
          res.render("registration", {
            name: req.session.name,
            message: "Registration failed, try again.",
          });
        }
      } else {
        res.render("registration", {
          name: req.session.name,
          message: "Confirm the correct password.",
        });
      }
    }
  } catch (error) {
    res.send(error.message);
  }
};

//=================================OTP VERIFICATION=====================================

const verifyOtp = async (req, res) => {
  try {
    const otpInput = req.body.otp;
    if (otpInput == otp) {
      const verified = await User.updateOne(
        { email: email2 },
        { $set: { is_verified: 1 } }
      );
      if (verified) {
        res.redirect("/loadLogin");
      } else {
        res.redirect("/otpPage");
        console.log(verified);
      }
    } else {
      res.render("otp", { message: "Enter the valid OTP." });
    }
  } catch (error) {
    console.error(error.message);
  }
};

//==================================RESEND OTP===================================================

const resendOtp = async (req, res) => {
  try {
    const randomNumber = Math.floor(Math.random() * 9000) + 1000;
    otp = randomNumber;
    sendVerifyEmail(nameResend, email2, otp);
    res.redirect("/otpPage");
  } catch (error) {
    console.log(error.message);
  }
};

//=================================LOGIN USER==================================================

const loginUser = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });
    if (userData && userData.is_admin == 0) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.is_block == 0) {
          if (userData.is_verified == 1) {
            // setting userId to session in userId variable
            req.session.user_id = userData._id;
            req.session.name = userData.name;

            res.redirect("/home");
          } else {
            res.render("login", {
              name: req.session.name,
              message: "Please verify your Account.",
            });
          }
        } else {
          res.render("login", {
            name: req.session.name,
            message: "Your account is blocked by Admin.",
          });
        }
      } else {
        res.render("login", {
          name: req.session.name,
          message: "Wrong password...!!",
        });
      }
    } else {
      res.render("login", {
        name: req.session.name,
        message: "This Account not registered, please SignUp.",
      });
    }
  } catch (error) {
    console.error(error.message);
  }
};

//=========================CREATING TOKEN AND CALL PASSWORD RECOVER=============================

const forgetPassMail = async (req, res) => {
  try {
    email = req.body.email;
    userData = await User.findOne({ email: email });
    if (userData) {
      if (userData.is_verified == 1) {
        const randomS = randomstring.generate();
        const updatedData = await User.updateOne(
          {
            email: email,
          },
          {
            $set: {
              token: randomS,
            },
          }
        );
        const user = await User.findOne({ email: email });
        passRecoverVerifyMail(user.name, user.email, randomS);
        res.redirect("/loadLogin");
      } else {
        res.render("forgetPass", {
          message: "Given mail is not verified",
          name: req.session.name,
        });
      }
    } else {
      res.render("forgetPass", {
        message: "Wrong Email Id",
        name: req.session.name,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

//====================================RESET PASSWORD PAGE==========================================

const loadResetPass = async (req, res) => {
  try {
    const token = req.query.token;
    const userData = await User.findOne({ token: token });
    if (userData) {
      res.render("recoverPass", {
        name: req.session.name,
        email: userData.email,
      });
    } else {
      res.status(404).render("404");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const newPass = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const secPassword = await securePassword(password);
    const updatedData = await User.updateOne(
      { email: email },
      {
        $set: { password: secPassword, token: "" },
      }
    );
    if (updatedData) {
      res.redirect("/");
    } else {
      res.status(404).render(404);
      console.log("pass not reset");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//=================================USER LOGOUT===========================================

const userLogout = async (req, res) => {
  try {
    req.session.user_id = false;
    req.session.name = false;
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

//=====================================SHOW USER PROFILE================================

const showProfile = async (req, res) => {
  try {
    const address = await Address.findOne({ user: req.session.user_id });
    const userData = await User.findOne({ _id: req.session.user_id });
    const walletAmount = userData.wallet
    const walletHistory = userData.walletHistory
    const coupons = await Coupon.find({status:true})
    const addressData = address.address;
    const cart = await Cart.findOne({userId:req.session.user_id})
    const wish = await Wishlist.findOne({user:req.session.user_id})
    let cartCount=0; 
    let wishCount=0;
    if(cart){cartCount = cart.products.length}
    if(wish){wishCount = wish.products.length}
    
    
    res.render("profile", {
      name: req.session.name,
      data: userData,
      address,
      walletHistory:walletHistory,
      addressData: addressData,
      walletAmount:walletAmount,
      coupons:coupons,
      wishCount,cartCount

    });
  } catch (error) {
    console.log(error.message);
  }
};

//======================================LOAD SHOP PAGE===================================
const loadShop = async (req, res) => {
  try {
    var page = 1;
    var limit = 8;
    if (req.query.page) {
      page = req.query.page;
    }

    const cart = await Cart.findOne({userId:req.session.user_id})
    const wish = await Wishlist.findOne({user:req.session.user_id})
    let cartCount=0; 
    let wishCount=0;
    if(cart){cartCount = cart.products.length}
    if(wish){wishCount = wish.products.length}

    //---------------setting pagination----------------------

    const products = await Product.find({ blocked: 0 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const count = await Product.find({ blocked: 0 }).countDocuments();

    totalPages = Math.ceil(count / limit);

    res.render("shop", {
      name: req.session.name,
      products: products,
      totalPages: totalPages,
      currentPage: page,
      previousPage: page - 1,
      cartCount,wishCount
    });
  } catch (error) {
    console.log(error.message);
  }
};

//====================================SHOW WALLET IN USER SIDE==========================



//===========================404 ERROR PAGE==============================================

const loadError = async (req, res) => {
  try {
    res.status(404).render("404");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  insertUser,
  loadRegister,
  otpPage,
  verifyOtp,
  loginUser,
  resendOtp,
  loadLogin,
  loadHome,
  userLogout,
  showProfile,
  forgetLoad,
  forgetPassMail,
  loadResetPass,
  newPass,
  loadShop,
  loadError,
  
};
