const Address = require("../models/addressModel");
const User = require("../models/userModel");
const Wishlist = require('../models/wishlistModel')
const Cart = require('../models/cartModel')

//===================================ADDRESS ADDING===========================================

const editProfile = async (req, res) => {
  try {
    const update = await User.updateOne({_id: req.session.user_id},
      {$set:{
      name: req.body.name,
      email: req.body.email,
      number: req.body.number
    }})
    if(update){
      res.json({success: true})
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//================================SHOW EDIT ADDRESS=====================================
const editAddressProfile = async(req,res)=> {
  try {
    const addressId = req.query.id;
    const session = req.session.user_id;
    
    const cart = await Cart.findOne({userId:req.session.user_id})
    const wish = await Wishlist.findOne({user:req.session.user_id})
    let cartCount=0; 
    let wishCount=0;
    if(cart){cartCount = cart.products.length}
    if(wish){wishCount = wish.products.length}

    const addressData = await Address.findOne(
      { user: session, "address._id": addressId },
      { "address.$": 1 }
    );
    const address = addressData.address[0];
    res.render("editAddressProfile", { name: req.session.name, user: address, wishCount,cartCount });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}
//=====================================EDIT BILLING ADDRESS PROFILE=====================
const editBillingAddress = async(req,res)=> {
  try {
    const addressId = req.body.id;
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

    res.json({success:true})
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

//===================================MULTIPLE ADDRESS ADDING=============================

const addMultipleAddress = async (req, res) => {
  try {
    const user = req.session.user_id;
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

      if (updated) res.json({success:true})
      else res.json({failed:true})
      
    } else {
      const data = new Address({
        user: user,
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
      const saved = await data.save();

      if(saved) res.json({success:true})
      else res.json({failed:true})

    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
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
    res.status(500).json({ error: 'Internal server error' });
  }
};

//=============================EDIT USER ADDRESS=======================

const loadEditAddress = async (req, res) => {
  try {
    const addressId = req.query.id;
    const session = req.session.user_id;
    
    const cart = await Cart.findOne({userId:req.session.user_id})
    const wish = await Wishlist.findOne({user:req.session.user_id})
    let cartCount=0; 
    let wishCount=0;
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
    res.status(500).json({ error: 'Internal server error' });
  }
};

//=============================EDIT ADDRESS FROM CHECKOUT PAGE====================

const updateAddress = async (req, res) => {
  try {
    const addressId = req.body.id;
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

    res.json({success:true})
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  editProfile,
  addMultipleAddress,
  removeAddress,
  loadEditAddress,
  updateAddress,
  editAddressProfile,
  editBillingAddress
  
};
