const Coupon = require("../models/couponModel");
const Order = require('../models/orderModel')
const Cart = require('../models/cartModel')

//=======================SHOW COUPONS PAGE ADMIN SIDE======================
const showCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.render("coupons", { coupons: coupons });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//==========================SHOW ADD COUPON PAGE=================
const addCouponPage = async (req, res) => {
  try {
    res.render("addCoupon");
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
//==========================ADD COUPON TO DB ADMIN SIDE==========
const addCoupon = async (req, res) => {
  try {
    const regexName = new RegExp(req.body.name, 'i');
    const already = await Coupon.findOne({ couponName: { $regex: regexName } });
    const regexCode = new RegExp(req.body.code, 'i');
    const Codealready = await Coupon.findOne({ couponCode: { $regex: regexCode } });
    const TodayDate = new Date()
    const Today = TodayDate.toISOString().split('T')[0];
    const active = req.body.activeDate;
    if(req.body.name.trim() === "" && req.body.code.trim() === "" && req.body.discount.trim() === "" && req.body.activeDate.trim() === "" && req.body.expDate.trim() === "" && req.body.criteriaAmount.trim() === "" && req.body.userLimit.trim() === ""){
      res.json({require:true})
    }else if(already){
      res.json({nameAlready:true})
    }else if(Codealready){
      res.json({codeAlready:true})
    }else if(req.body.discount <= 0){
      res.json({disMinus:true})
    }else if(req.body.criteriaAmount <= 0){
      res.json({amountMinus:true})
    }else if(active > req.body.expDate && req.body.expDate < Today){
      res.json({expDate:true})
    }else if(req.body.userLimit <= 0){
      res.json({limit:true})
    }else{
        const data = new Coupon({
        couponName: req.body.name,
        couponCode: req.body.code,
        discountAmount: req.body.discount,
        activationDate: req.body.activeDate,
        expiryDate: req.body.expDate,
        criteriaAmount: req.body.criteriaAmount,
        usersLimit: req.body.userLimit,
      });
      await data.save();
      res.json({success:true})
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//===================================COUPON BLOCK AND UNBLOCK====================

const blockCoupons = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ _id: req.query.id });
    if (coupon.status == true ) {
      await Coupon.updateOne(
        { _id: req.query.id },
        { $set: { status: false } }
      );
    } else {
      await Coupon.updateOne({ _id: req.query.id }, { $set: { status: true } });
    }
    res.json({success:true})
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
//===================================SHOW EDIT COUPON PAGE========================
const showEditPage = async (req, res) => {
  try {
    const couponData = await Coupon.findOne({ _id: req.query.id });
    res.render("editCoupon", { coupon: couponData });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//=================================UPDATE COUPON DATA==============================

const updateCoupon = async (req, res) => {
  try {
    const TodayDate = new Date()
    const Today = TodayDate.toISOString().split('T')[0];
    const active = req.body.activeDate;
    if(req.body.name.trim() === "" || req.body.code.trim() === "" || req.body.discount.trim() === "" || req.body.activeDate.trim() === "" || req.body.expDate.trim() === "" || req.body.criteriaAmount.trim() === "" || req.body.userLimit.trim() === ""){
      res.json({require:true})
    }else if(req.body.discount <= 0){
      res.json({disMinus:true})
    }else if(req.body.criteriaAmount <= 0){
      res.json({amountMinus:true})
    }else if(active > req.body.expDate && req.body.expDate < Today){
      res.json({expDate:true})
    }else if(req.body.userLimit <= 0){
      res.json({limit:true})
    }else{
      const updated = await Coupon.updateOne(
        { _id: req.query.id },
        {
          $set: {
            couponName: req.body.name,
            couponCode: req.body.code,
            discountAmount: req.body.discount,
            activationDate: req.body.activeDate,
            expiryDate: req.body.expDate,
            criteriaAmount: req.body.criteriaAmount,
            usersLimit: req.body.userLimit,
          },
        }
      );
      if(updated){
          res.json({success:true})
      }else{
          res.json({failed:true})
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
//==============================DELETE APPLIED COUPON============================

const deleteAppliedCoupon = async(req,res)=> {
  try {

    const code = req.body.code;
    const couponData = await Coupon.findOne({ couponCode: code });
    const amount = Number(req.body.amount);
    const disAmount = couponData.discountAmount;
    const disTotal = Math.round(amount + disAmount);
    const deleteApplied = await Cart.updateOne({userId:req.session.user_id},{$set:{applied:"not"}})
    if(deleteApplied){
      res.json({success:true, disTotal})
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

//================================APPLY COUPON====================================

const applyCoupon = async (req, res) => {
  try {
    const code = req.body.code;
    req.session.code = code;
    const amount = Number(req.body.amount);
    const userExist = await Coupon.findOne({
      couponCode: code,
      usedUsers: { $in: [req.session.user_id] },
    });
    
    if (userExist) {
      res.json({ user: true });
    } else {
      const couponData = await Coupon.findOne({ couponCode: code });
      
      if (couponData) {
        if (couponData.usersLimit <= 0) {
          res.json({ limit: true });
        } else {
          if (couponData.status == false) {
            res.json({ status: true });
          } else {
            if (couponData.expiryDate <= new Date()) {
              res.json({ date: true });
            }else if(couponData.activationDate >= new Date()){
              res.json({ active : true})
            }else {
              if (couponData.criteriaAmount >= amount) {
                res.json({ cartAmount: true });
              } else {
                //user limit decreasing
                // await Coupon.updateOne({couponCode:code},{$inc:{usersLimit: -1 }})
                //user name adding
                // await Coupon.updateOne({couponCode:code},{$push:{usedUsers:req.session.user_id}})
                  
                  const disAmount = couponData.discountAmount;
                  const disTotal = Math.round(amount - disAmount);
                  await Cart.updateOne({userId:req.session.user_id},{$set:{applied:"applied"}})
                                
                  return res.json({ amountOkey: true, disAmount, disTotal });
               
              }
            }
          }
        }
      } else {
        res.json({ invalid: true });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports = {
  showCoupons,
  addCouponPage,
  addCoupon,
  blockCoupons,
  showEditPage,
  updateCoupon,
  applyCoupon,
  deleteAppliedCoupon
};
