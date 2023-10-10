const Address = require("../models/addressModel");
const User = require("../models/userModel");
const Wishlist = require('../models/wishlistModel')
const Cart = require('../models/cartModel')

//===================================ADDRESS ADDING===========================================

const addAddress = async (req, res) => {
  try {
    const user = req.session.user_id;
    const userData = await User.findOne({ _id: req.session.user_id });

    const addressData = await Address.findOne({ user: req.session.user_id });

    if (addressData) {
      const update = await Address.updateOne(
        { user: user },
        {
          $set: {
            address: {
              fullname: req.body.fullname,
              mobile: req.body.mobile,
              email: req.body.email,
              houseName: req.body.houseName,
              city: req.body.city,
              state: req.body.state,
              pin: req.body.pin,
            },
          },
        }
      );
      res.redirect("/profile");
    } else {
      const data = new Address({
        user: userData._id,
        address: [
          {
            fullname: req.body.fullname,
            mobile: req.body.mobile,
            email: req.body.email,
            houseName: req.body.houseName,
            city: req.body.city,
            state: req.body.state,
            pin: req.body.pin,
          },
        ],
      });
      await data.save();
      res.redirect("/profile");
    }
  } catch (error) {
    console.log(error);
    res.status(404).render("404");
  }
};

//===================================MULTIPLE ADDRESS ADDING=============================

const addMultipleAddress = async (req, res) => {
  try {
    const user = req.session.user_id;
    // const userData = await User.findOne({ _id: user });
    const addressData = await Address.findOne({ user: req.session.user_id });
    if (addressData) {
      const updated = await Address.updateOne(
        { user: user },
        {
          $push: {
            address: {
              fullname: req.body.fullname,
              mobile: req.body.mobile,
              email: req.body.email,
              houseName: req.body.houseName,
              city: req.body.city,
              state: req.body.state,
              pin: req.body.pin,
            },
          },
        }
      );
      if (updated) {
        res.redirect("/profile");
      } else {
        res.redirect("/profile");
        console.log("not added");
      }
    } else {
      res.redirect("/profile");
    }
  } catch (error) {
    console.log(error.message);
    res.status(404).render("404");
  }
};

//=========================REMOVE ADDRESS FROM CHECKOUT PAGE==================

const removeAddress = async (req, res) => {
  try {
    const id = req.body.id;
    await Address.updateOne(
      { user: req.session.user_id },
      { $pull: { address: { _id: id } } }
    );
    res.json({ remove: true });
  } catch (error) {
    console.log(error.message);
    res.status(404).render("404");
  }
};

//=============================EDIT USER ADDRESS=======================

const loadEditAddress = async (req, res) => {
  try {
    const addressId = req.query.id;
    const session = req.session.user_id;
    
    const cart = await Cart.findOne({userId:req.session.user_id})
    const wish = await Wishlist.findOne({user:req.session.user_id})
    let cartCount; 
    let wishCount;
    if(cart){cartCount = cart.products.length}
    if(wish){wishCount = wish.products.length}

    const addressData = await Address.findOne(
      { user: session, "address._id": addressId },
      { "address.$": 1 }
    );
    const address = addressData.address[0];
    res.render("editAddress", { name: req.session.name, user: address, wishCount,cartCount });
  } catch (error) {
    console.log(error.message);
  }
};

//=============================EDIT ADDRESS FROM CHECKOUT PAGE====================

const updateAddress = async (req, res) => {
  try {
    const addressId = req.query.id;
    const updated = await Address.updateOne(
      { user: req.session.user_id, "address._id": addressId },
      {
        $set: {
          "address.$.fullname": req.body.fullname,
          "address.$.mobile": req.body.mobile,
          "address.$.email": req.body.email,
          "address.$.houseName": req.body.houseName,
          "address.$.city": req.body.city,
          "address.$.state": req.body.state,
          "address.$.pin": req.body.pin,
        },
      }
    );

    res.redirect("/checkOut");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  addAddress,
  addMultipleAddress,
  removeAddress,
  loadEditAddress,
  updateAddress,
};
