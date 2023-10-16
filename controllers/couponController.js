const Coupon = require("../models/couponModel");
const Order = require('../models/orderModel')

//=======================SHOW COUPONS PAGE ADMIN SIDE======================
const showCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.render("coupons", { coupons: coupons });
  } catch (error) {
    console.log(error.message);
  }
};

//==========================SHOW ADD COUPON PAGE=================
const addCouponPage = async (req, res) => {
  try {
    res.render("addCoupon");
  } catch (error) {
    console.log(error.message);
  }
};
//==========================ADD COUPON TO DB ADMIN SIDE==========
const addCoupon = async (req, res) => {
  try {
    const already = await Coupon.findOne({ couponCode: req.body.code });

    if (already) {
      res.render("addCoupon", { message: "Given Coupon Already Exist !" });
    } else {
      const data = new Coupon({
        couponName: req.body.name,
        couponCode: req.body.code,
        discountAmount: req.body.discount,
        activationDate: req.body.activeDate,
        expiryDate: req.body.expDate,
        criteriaAmount: req.body.criteriaAmount,
        usersLimit: req.body.userLimit,
      });
      const saved = await data.save();
      res.redirect("/admin/showCoupon");
    }
  } catch (error) {
    console.log(error.message);
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
    res.redirect("/admin/showCoupon");
  } catch (error) {
    console.log(error.message);
  }
};
//===================================SHOW EDIT COUPON PAGE========================
const showEditPage = async (req, res) => {
  try {
    const couponData = await Coupon.findOne({ _id: req.query.id });
    res.render("editCoupon", { coupon: couponData });
  } catch (error) {
    console.log(error.message);
  }
};

//=================================UPDATE COUPON DATA==============================

const updateCoupon = async (req, res) => {
  try {
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
        res.redirect('/admin/showCoupon')
    }else{
        console.log('not updated');
    }
  } catch (error) {
    console.log(error.message);
  }
};

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
                await Coupon.updateOne({couponCode:code},{$inc:{usersLimit: -1 }})
                //user name adding
                await Coupon.updateOne({couponCode:code},{$push:{usedUsers:req.session.user_id}})
                  
                  const disAmount = couponData.discountAmount;
                  const disTotal = Math.round(amount - disAmount);
                  
                                
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
  }
};


module.exports = {
  showCoupons,
  addCouponPage,
  addCoupon,
  blockCoupons,
  showEditPage,
  updateCoupon,
  applyCoupon
};
