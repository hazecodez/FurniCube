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
const Category = require('../models/categoryModel')
let otp;

//=================================PASSWORD BCRYPTION=====================================

const securePassword = async (password) => {
  try {
    const hashPassword = await bcrypt.hash(password, 10);
    return hashPassword;
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//===========================FORGET PASSWORD PAGE LOAD====================================

const forgetLoad = async (req, res) => {
  try {
    const cart = await Cart.findOne({userId:req.session.user_id})
    const wish = await Wishlist.findOne({user:req.session.user_id})
    let cartCount=0; 
    let wishCount=0;
    if(cart){cartCount = cart.products.length}
    if(wish){wishCount = wish.products.length}
    res.render("forgetPass", { name: req.session.name, wishCount,cartCount });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
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
        ' ,please click here to <a href="http://localhost:5030/reset_password?token=' +
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
    res.status(500).json({ error: 'Internal server error' });
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
        "</h1> <h3>  to verify your FurniCube Account. </h3>",
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
    res.status(500).json({ error: 'Internal server error' });
  }
};

//============================LOAD REGISTRATION PAGE=====================================

const loadRegister = async (req, res) => {
  try {
    res.render("registration", { name: req.session.name });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//==================================LOAD OTP PAGE=======================================

const otpPage = async (req, res) => {
  try {
    let verifyErr = req.session.verifyErr;
    let otpsend = req.session.otpsend
    res.render("otp", { name: req.session.name, verifyErr,otpsend });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//==============================LOAD LOGIN PAGE=========================================

const loadLogin = async (req, res) => {
  try {
    let regSuccess = req.session.regSuccess;
    const cart = await Cart.findOne({userId:req.session.user_id})    
    if(cart){
      const cartCount = cart.products.length
      res.render("login", { name: req.session.name,cartCount:cartCount , regSuccess});
    }else{
      res.render("login", { name: req.session.name,cartCount:0 ,regSuccess});
    }

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//==============================LOAD ABOUT US PAGE=======================================
const showAbout = async(req,res)=> {
  try {
    const cart = await Cart.findOne({userId:req.session.user_id})
    const wish = await Wishlist.findOne({user:req.session.user_id})
    let cartCount=0; 
    let wishCount=0;
    if(cart){cartCount = cart.products.length}
    if(wish){wishCount = wish.products.length}
    res.render('aboutUs',{name: req.session.name,cartCount,wishCount})
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

//===============================LOAD CONTACT US PAGE====================================
const showContact = async(req,res)=> {
  try {
    const cart = await Cart.findOne({userId:req.session.user_id})
    const wish = await Wishlist.findOne({user:req.session.user_id})
    let cartCount=0; 
    let wishCount=0;
    if(cart){cartCount = cart.products.length}
    if(wish){wishCount = wish.products.length}
    res.render('contactUs',{name: req.session.name,cartCount,wishCount})
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

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
    res.status(500).json({ error: 'Internal server error' });
  }
};

//=============================INSERTING USER REGISTERED DATA=============================

const insertUser = async (req, res) => {
  try {
    console.log('hey');
    const email = req.body.email;
    const mobile = req.body.number;
    const password = req.body.password;
    const name = req.body.name;
    const conPass = req.body.con_password
    if(name.length <= 2){
      res.json({name:true})
    }else{
      // Check if the email is empty
    if (email.trim() === "" && mobile.trim() === "" && password.trim() === "" && name.trim() === "" && conPass.trim() === "" ) {
      res.json({require:true})
      }else{
          // Email validation using a regular expression
        var emailPattern = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
        if (!emailPattern.test(email)) {
            res.json({emailPatt:true})
          }else{
                  // Mobile number validation (assumes a 10-digit number)
          var mobilePattern = /^\d{10}$/;
          if (!mobilePattern.test(mobile) || mobile === "0000000000"  ) {
              res.json({mobile:true})
            }else{
                // Password validation (assumes a minimum length of 4 characters)
                if (password.length < 4) {
                  res.json({password:true})
                  }else{
                    // If all validations pass, you can proceed with the signup process
                    //check the email which is already exist
                    const checkEmail = await User.findOne({ email: req.body.email });
                    if (checkEmail) {
                      res.json({emailalready:true})
                      } else {
                        if (password == conPass) {
                            //checking password and confirm password are same
                          const secPassword = await securePassword(req.body.password);
                          const user = new User({
                            name: name,
                            email: email,
                            number: mobile,
                            password: secPassword,
                          });
                          const userData = await user.save();
                          if(userData){
                            //otp generation
                          const randomNumber = Math.floor(Math.random() * 9000) + 1000;
                          otp = randomNumber;
                          req.session.email = req.body.email;
                          req.session.pass = secPassword;
                          req.session.userName = req.body.name;
                          req.session.number = req.body.number;
                          
                          //calling email verification
                          sendVerifyEmail(req.body.name, req.body.email, randomNumber);
                          setTimeout(() => {
                            otp = Math.floor(Math.random() * 9000) + 1000;
                          }, 60000);
                          req.session.otpsend = true;
                          res.json({success:true})
                          }else{
                            res.json({notsaved:true})
                              }                        
                            } else {
                                  res.json({wrongpass:true})
                                }
                          }
                    }
              }
            }
        }
    }
      

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//==================================RESEND OTP===================================================

const resendOtp = async (req, res) => {
  try {
    let otpsend =  req.session.otpsend;
    let verifyErr = req.session.verifyErr
    let email = req.session.email;
    let name = 'User'
    let randomNumber = Math.floor(Math.random() * 9000) + 1000;
    otp = randomNumber;
    setTimeout(() => {
      otp = Math.floor(Math.random() * 9000) + 1000;
    }, 60000);
    sendVerifyEmail(name, email, randomNumber);
    res.render("otp", { name: req.session.name,verifyErr,otpsend, resend: "Resend the otp to your email address." });
    
  } catch (error) { 
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//=================================OTP VERIFICATION=====================================

const verifyOtp = async (req, res) => {
  try {
    req.session.verifyErr = false;
    req.session.otpsend = false;
    const otpInput = parseInt(req.body.otp)
    const email = req.session.email;
    if (otpInput === otp) {
      const verified = await User.updateOne(
        { email: email },
        { $set: { is_verified: 1 } }
      )
      if (verified) {
        req.session.regSuccess = true;
        res.json({success:true})
      } else {
        res.json({error:true})
      }
    } else {
      res.json({wrong:true})
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//===================================CHANGE PASSWORD====================================
const changePassword = async(req,res)=> {
  try {
    const userData = await User.findOne({_id: req.session.user_id})
    const passwordMatch = await bcrypt.compare(req.body.currPass, userData.password);
    if(passwordMatch){
      const secPassword = await securePassword(req.body.newPass);
      await User.updateOne({_id:req.session.user_id},{$set:{password: secPassword}})
      res.json({changed:true})
    }else{
      console.log('wroong');
      res.json({wrongpass: true})
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}


//=================================LOGIN USER==================================================

const loginUser = async (req, res) => {
  try {
    const email = req.body.email;
    const name = 'User'
    const password = req.body.password;
    const userData = await User.findOne({ email: email });
    if (userData && userData.is_admin == 0) {
      if(userData.is_verified == 1){

        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (passwordMatch) {
          if (userData.is_block == 0) {
            // setting userId to session in userId variable
            req.session.user_id = userData._id;
            req.session.name = userData.name;
            req.session.regSuccess = false;
            res.json({success:true})
          } else {
          res.json({blocked:true})
        }
        } else {
          res.json({wrong:true})
          }
      }else{
        const randomNumber = Math.floor(Math.random() * 9000) + 1000;
        otp = randomNumber;
        req.session.email = req.body.email;
        sendVerifyEmail(name, email, randomNumber);
        setTimeout(() => {
          otp = Math.floor(Math.random() * 9000) + 1000;
        }, 60000);
        req.session.verifyErr = true;
        res.json({verify:true})
      }
    } else {
      res.json({register:true})
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
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
    res.status(500).json({ error: 'Internal server error' });
  }
};

//====================================RESET PASSWORD PAGE==========================================

const loadResetPass = async (req, res) => {
  try {
    const cart = await Cart.findOne({userId:req.session.user_id})
    const wish = await Wishlist.findOne({user:req.session.user_id})
    let cartCount=0; 
    let wishCount=0;
    if(cart){cartCount = cart.products.length}
    if(wish){wishCount = wish.products.length}
    const token = req.query.token;
    const userData = await User.findOne({ token: token });
    if (userData) {
      res.render("recoverPass", {
        name: req.session.name,
        email: userData.email,
        wishCount,
        cartCount
      });
    } else {
      console.log('no token');
      res.redirect('/')
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//============================NEW PASS CREATION=============================

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
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//=================================USER LOGOUT===========================================

const userLogout = async (req, res) => {
  try {
    req.session.user_id = false;
    req.session.name = false;
    req.session.otp = false;
    req.session.email = false;
    req.session.pass = false;
    req.session.userName = false;
    req.session.number = false;
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//=====================================SHOW USER PROFILE================================

const showProfile = async (req, res) => {
  try {
    const address = await Address.findOne({ user: req.session.user_id });
    let addressData;
    let user_id = req.session.user_id
    if(address){
      addressData = address.address;
    }
    const userData = await User.findOne({ _id: req.session.user_id });
    let walletAmount;
    let walletHistory;
    if(userData){
      walletAmount = userData.wallet
      walletHistory = userData.walletHistory
    }
    
    const coupons = await Coupon.find({
      status: true,
      expiryDate: { $gte: new Date() }
    })
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
      wishCount,cartCount,
      userData

    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//==================================FILTER PRODUCTS IN SHOP=============================
const filterProduct = async(req,res)=> {
  try {
    let cate = req.body.category;
    let priceSort = parseInt(req.body.price);
    const category = await Category.find({blocked:0})
    
    const cart = await Cart.findOne({userId:req.session.user_id})
    const wish = await Wishlist.findOne({user:req.session.user_id})
    let cartCount=0; 
    let wishCount=0;
    if(cart){cartCount = cart.products.length}
    if(wish){wishCount = wish.products.length}
    let filtered;
    
    if(req.body.category == "allCate"){
      filtered = await Product.find({blocked:0}).sort({price:priceSort})
    }else{
      filtered = await Product.find({category: cate,blocked:0}).sort({price:priceSort})
    }    
    
    res.render("shop",{
      name: req.session.name,
      products: filtered,
      totalPages:0,
      cartCount,wishCount,category
    })
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" })
  }
}
//==================================SEARCH PRODUCT IN SHOP==============================
const searchPro = async(req,res)=>{
  try {
    const category = await Category.find({blocked:0})
    const name = req.query.q
    const regex = new RegExp(`^${name}`, 'i');
    
    const cart = await Cart.findOne({userId:req.session.user_id})
    const wish = await Wishlist.findOne({user:req.session.user_id})
    let cartCount=0; 
    let wishCount=0;
    if(cart){cartCount = cart.products.length}
    if(wish){wishCount = wish.products.length}

    const products = await Product.find({name: { $regex: regex }, blocked: 0 })

    res.render("shop", {
      name: req.session.name,
      products: products,
      totalPages: 0,
      cartCount,wishCount,category
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

//======================================LOAD SHOP PAGE===================================
const loadShop = async (req, res) => {
  try {
    const category = await Category.find({blocked:0})
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

    const totalPages = Math.ceil(count / limit);
    
    res.render("shop", {
      name: req.session.name,
      products: products,
      totalPages: totalPages,
      currentPage: page,
      previousPage: page - 1,
      cartCount,wishCount,category
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//===========================404 ERROR PAGE==============================================

const loadError = async (req, res) => {
  try {
    res.status(404).render("404");
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
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
  searchPro,
  filterProduct,
  loadError,
  changePassword,
  showAbout,
  showContact
  
};
