const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Product = require("../models/productModel");
const dotenv = require("dotenv");
dotenv.config();
const Address = require("../models/addressModel");
const randomstring = require("randomstring");

let otp;
let email2;
let nameResend;
//for accessing email address in otp page

// password bcryption
const securePassword = async (password) => {
  try {
    const hashPassword = await bcrypt.hash(password, 10);
    return hashPassword;
  } catch (error) {
    console.error(error.message);
    res.status(404).render("404");
  }
};

//forget password page load
const forgetLoad = async (req, res) => {
  try {
    res.render("forgetPass");
  } catch (error) {
    console.log(error.message);
    res.status(404).render("404");
  }
};

//for sent mail
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
      "<p>hi " +
      name +
      ' ,please click here to<a href="https://localhost:5030/reset_password?token=' +
      token +
      '">Reset</a> your password </p>',
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
    res.status(404).render("404");
  }
};

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
        "</h1> <h3>  to log in to your BloomStyle Account. </h3>",
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
    res.status(404).render("404");
  }
};

//load registration page
const loadRegister = async (req, res) => {
  try {
    res.render("registration");
  } catch (error) {
    console.error(error.message);
    res.status(404).render("404");
  }
};

//load otp page
const otpPage = async (req, res) => {
  try {
    res.render("otp");
  } catch (error) {
    console.error(error.message);
    res.status(404).render("404");
  }
};

//load login page
const loadLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.error(error.message);
    res.status(404).render("404");
  }
};

//load Home Page

const loadHome = async (req, res) => {
  try {
    const products = await Product.find({ blocked: 0 });
    
    res.render("home", { name: req.session.name, products: products });
  } catch (error) {
    console.error(error.message);
    res.status(404).render("404");
  }
};

//saving user registered data
const insertUser = async (req, res) => {
  try {
    //check the email which is already exist
    const checkEmail = await User.findOne({ email: req.body.email });
    if (checkEmail) {
      res.render("registration", {
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
          res.redirect("/otpPage");
        } else {
          res.render("registration", {
            message: "Registration failed, try again.",
          });
        }
      } else {
        res.render("registration", {
          message: "Confirm the correct password.",
        });
      }
    }
  } catch (error) {
    res.send(error.message);
    res.status(404).render("404");
  }
};

//otp verification
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
    res.status(404).render("404");
  }
};

//resend Otp
const resendOtp = async (req, res) => {
  try {
    const randomNumber = Math.floor(Math.random() * 9000) + 1000;
    otp = randomNumber;
    sendVerifyEmail(nameResend, email2, otp);
    res.redirect("/otpPage");
  } catch (error) {
    console.log(error.message);
    res.status(404).render("404");
  }
};

// Login user
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
            res.render("login", { message: "Please verify your Account." });
          }
        } else {
          res.render("login", { message: "Your account is blocked by Admin." });
        }
      } else {
        res.render("login", { message: "Wrong password...!!" });
      }
    } else {
      res.render("login", {
        message: "This Account not registered, please SignUp.",
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(404).render("404");
  }
};

// creating token and call password recover email
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
        res.redirect('/loadLogin')
      } else {
        res.render("forgetPass", { message: "Given mail is not verified" });
      }
    } else {
      res.render("forgetPass", { message: "Wrong Email Id" });
    }
  } catch (error) {
    console.log(error);
    res.status(404).render("404");
  }
};

const loadResetPass = async (req, res) => {
  try {
    
    const token = req.query.token;
    console.log(token);
    const userData = await User.findOne({ token: token });
    if (userData) {
      res.render("recoverPass", { email: userData.email });
    } else {
      res.status(404).render("404");
    }
  } catch (error) {
    console.log(error.message);
    res.status(404).render("404");
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
    if(updatedData){
      res.redirect('/')
    }else{
      res.status(404).render(404);
      console.log('pass not reset');
    }
  } catch (error) {
    console.log(error.message);
    res.status(404).render(404);
  }
};

//user logout
const userLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
    res.status(404).render("404");
  }
};

//user profile

const showProfile = async (req, res) => {
  try {
    const address = await Address.findOne({ user: req.session.user_id });
    const userData = await User.findOne({ _id: req.session.user_id });
    res.render("profile", {
      name: req.session.name,
      data: userData,
      address,
    });
  } catch (error) {
    console.log(error.message);
    res.status(404).render("404");
  }
};

//load Chechout
const loadCheckOut = async(req,res)=> {
  try {
    res.render('checkOut',{name:req.session.name})
  } catch (error) {
    console.log(error.message);
  }
}



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
  loadCheckOut
};
