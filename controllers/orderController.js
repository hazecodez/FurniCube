const Cart = require("../models/cartModel");
const Address = require("../models/addressModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");

//===========================PLACE ORDER THROUGH COD=========================

const placeOrder = async (req, res) => {
  try {
    const id = req.session.user_id;
    const address = req.body.address;
    const cartData = await Cart.findOne({ userId: req.session.user_id });
    const products = cartData.products;
    const total = parseInt(req.body.Total);
    const paymentMethods = req.body.payment;
    const userData = await User.findOne({ _id: id });
    const name = userData.name;
    const uniNum = Math.floor(Math.random() * 900000) + 100000;
    const status = paymentMethods === "COD" ? "placed" : "pending";

    const order = new Order({
      deliveryDetails: address,
      uniqueId: uniNum,
      userId: id,
      userName: name,
      paymentMethod: paymentMethods,
      products: products,
      totalAmount: total,
      date: new Date(),
      status: status,
    });

    const orderData = await order.save();

    const orderid = order._id;
    if (orderData) {
      
      if (order.status === "placed") {
        await Cart.deleteOne({ userId: req.session.user_id });
        for (let i = 0; i < products.length; i++) {
          const pro = products[i].productId;
          const count = products[i].count;
          await Product.findOneAndUpdate(
            { _id: pro },
            { $inc: { quantity: -count } }
          );
        }

        res.json({ codsuccess: true, orderid });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

//============================ORDER SUCCESS PAGE================================

const successPage = async (req, res) => {
  try {
    res.render("thankYou", { name: req.session.name });
  } catch (error) {
    console.log(error.message);
  }
};

//=================================SHOW ORDERS LIST IN ADMIN SIDE====================

const showOrder = async (req, res) => {
  try {
    const ordersData = await Order
      .find()
      .populate("products.productId")
      .sort({ date: -1 });
    res.render("orderDetails", { orders: ordersData });
  } catch (error) {
    console.log(error.message);
  }
};

//====================================VIEW ORDER DETAILS FOR ADMIN=====================

const loadProductdetails = async (req, res) => {
    try {
      const id = req.query.id;
      console.log(id);
      const orderedProduct = await Order
        .findOne({ _id: id })
        .populate("products.productId");
  
      res.render("orderFullDetails", { orders: orderedProduct});
    } catch (error) {
      console.log(error);
    }
  };


//=========================================SHOW USER ORDERS USER SIDE================================

const userOrders = async(req,res)=> {
    try {
        const userId = req.session.user_id;
        const orderData = await Order.find({userId:userId})
        res.render('orders',{name:req.session.name, orders:orderData})
        
    } catch (error) {
        console.log(error.message);
    }
}

//========================================FULL DETAILS OF EACH ORDERS IN USER SIDE=====================

const userOderDetails = async(req,res)=> {
    try {
        res.render('orderedProduct',{name:req.session.name})
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
  placeOrder,
  successPage,
  showOrder,
  loadProductdetails,
  userOrders,
  userOderDetails
};
