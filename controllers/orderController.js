const Cart = require("../models/cartModel");
const Address = require("../models/addressModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();
const Wishlist = require("../models/wishlistModel");
const path = require('path')
const fs = require('fs')
const puppeteer = require('puppeteer')
const ejs = require('ejs')
const Coupon = require('../models/couponModel')

//==========================RAZORPAY INSTANCE================================

var instance = new Razorpay({
  key_id: process.env.RazorId,
  key_secret: process.env.RazorKey,
});

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
    const walletBalance = userData.wallet;

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
      //--------------------CASH ON DELIVERY-------------------//

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
        if(req.session.code){
          const coupon = await Coupon.findOne({couponCode:req.session.code});
          const disAmount = coupon.discountAmount;
          await Order.updateOne({_id:orderid},{$set:{discount:disAmount}});
          res.json({ codsuccess: true, orderid });
        }
        res.json({ codsuccess: true, orderid });
      } else {
        //-------------IF THE ORDER IS NOT COD-----------------//

        const orderId = orderData._id;
        const totalAmount = orderData.totalAmount;

        //---------------PAYMENT USING WALLET------------------//

        if (order.paymentMethod == "wallet") {
          if (walletBalance >= total) {
            const result = await User.findOneAndUpdate(
              { _id: id },
              {
                $inc: { wallet: -total },
                $push: {
                  walletHistory: {
                    date: new Date(),
                    amount: total,
                    reason: "Purchaced Amount Debited.",
                  },
                },
              },
              { new: true }
            );
            await Order.findByIdAndUpdate(
              { _id: orderid },
              { $set: { status: "placed" } }
            );
            if (result) {
              console.log("amount debited from wallet");
            } else {
              console.log("not debited from wallet");
            }
            await Cart.deleteOne({ userId: req.session.user_id });
            for (let i = 0; i < products.length; i++) {
              const pro = products[i].productId;
              const count = products[i].count;
              await Product.findOneAndUpdate(
                { _id: pro },
                { $inc: { quantity: -count } }
              );
            }
            if(req.session.code){
              const coupon = await Coupon.findOne({couponCode:req.session.code});
              const disAmount = coupon.discountAmount;
              await Order.updateOne({_id:orderid},{$set:{discount:disAmount}});
              res.json({ codsuccess: true, orderid });
            }

            res.json({ codsuccess: true, orderid });
          } else {
            res.json({ walletFailed: true });
          }

          //--------------IF PAYMENT THROUGH RAZORPAY-------------//
        } else if (order.paymentMethod == "onlinePayment") {
          var options = {
            amount: totalAmount * 100,
            currency: "INR",
            receipt: "" + orderId,
          };

          instance.orders.create(options, function (err, order) {
            res.json({ order });
          });
        }
      }
    } else {
      console.log("not aadddeddd");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//============================VERIFY PAYMENT====================================

const verifyPayment = async (req, res) => {
  try {
    const cartData = await Cart.findOne({ userId: req.session.user_id });
    const products = cartData.products;
    const details = req.body;
    const hmac = crypto.createHmac("sha256", process.env.RazorKey);

    hmac.update(
      details.payment.razorpay_order_id +
        "|" +
        details.payment.razorpay_payment_id
    );
    const hmacValue = hmac.digest("hex");

    if (hmacValue === details.payment.razorpay_signature) {
      for (let i = 0; i < products.length; i++) {
        const pro = products[i].productId;
        const count = products[i].count;
        await Product.findByIdAndUpdate(
          { _id: pro },
          { $inc: { quantity: -count } }
        );
      }
      await Order.findByIdAndUpdate(
        { _id: details.order.receipt },
        { $set: { status: "placed" } }
      );

      await Order.findByIdAndUpdate(
        { _id: details.order.receipt },
        { $set: { paymentId: details.payment.razorpay_payment_id } }
      );
      await Cart.deleteOne({ userId: req.session.user_id });
      const orderid = details.order.receipt;

      //----discount adding orderDB------//
      if(req.session.code){
        const coupon = await Coupon.findOne({couponCode:req.session.code});
        const disAmount = coupon.discountAmount;
        await Order.updateOne({_id:orderid},{$set:{discount:disAmount}});
        res.json({ codsuccess: true, orderid });
      }
      res.json({ codsuccess: true, orderid });

    } else {
      await Order.findByIdAndRemove({ _id: details.order.receipt });
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//============================ORDER SUCCESS PAGE================================

const successPage = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.session.user_id });
    const wish = await Wishlist.findOne({ user: req.session.user_id });
    let cartCount=0; 
    let wishCount=0;
    if (cart) {
      cartCount = cart.products.length;
    }
    if (wish) {
      wishCount = wish.products.length;
    }

    res.render("thankYou", { name: req.session.name, wishCount, cartCount });
  } catch (error) {
    console.log(error.message);
  }
};

//================================ORDER CANCELING====================================

const orderCancel = async (req, res) => {
  try {
    const orderId = req.body.orderid;
    const Id = req.session.user_id;
    const cancelReason = req.body.reason;
    const cancelAmount = req.body.totalPrice;
    const amount = parseInt(cancelAmount);
    const orderData = await Order.findOne({ _id: orderId });
    const products = orderData.products;

    if (orderData.paymentMethod != "COD" && orderData.status != "pending") {
      const refundOption = "" + req.body.refundOption;

      if (refundOption === "Wallet") {
        const user = await User.findById(Id);
        const result = await User.findOneAndUpdate(
          { _id: Id },
          {
            $inc: { wallet: amount },
            $push: {
              walletHistory: {
                date: new Date(),
                amount: amount,
                reason: "Cancelled Product Amount Credited",
              },
            },
          },
          { new: true }
        );

        if (result) {
          console.log(`Added ${amount} to the wallet.`);
        } else {
          console.log("User not found.");
        }
        const updatedData = await Order.updateOne(
          { _id: orderId },
          {
            $set: { cancelReason: cancelReason, status: "cancelled" },
          }
        );

        for (let i = 0; i < products.length; i++) {
          let pro = products[i].productId;
          let count = products[i].count;
          await Product.findOneAndUpdate(
            { _id: pro },
            { $inc: { quantity: count } }
          );
        }

        if (updatedData) {
          console.log("order status updated to cancel");
        } else {
          console.log("order status not updated");
        }
        console.log("User wallet updated successfully.");
        res.redirect("/orders");
      } else {
        // Refund to user bank account
      }

      res.redirect("/orders");
    } else if (
      orderData.paymentMethod == "COD" ||
      orderData.status == "pending"
    ) {
      // Change the order status
      const updatedData = await Order.updateOne(
        { _id: orderId },
        {
          $set: { cancelReason: cancelReason, status: "cancelled" },
        }
      );

      for (let i = 0; i < products.length; i++) {
        const pro = products[i].productId;
        const count = products[i].count;
        await Product.findOneAndUpdate(
          { _id: pro },
          { $inc: { quantity: count } }
        );
      }

      if (updatedData) {
        res.redirect("/orders");
      } else {
        console.log("order status not updated");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

//=================================SHOW ORDERS LIST IN ADMIN SIDE====================

const showOrder = async (req, res) => {
  try {
    const ordersData = await Order.find()
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
    const orderedProduct = await Order.findOne({ _id: id }).populate(
      "products.productId"
    );

    res.render("orderFullDetails", { orders: orderedProduct });
  } catch (error) {
    console.log(error);
  }
};

//=========================================SHOW USER ORDERS USER SIDE================================

const userOrders = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.session.user_id });
    const wish = await Wishlist.findOne({ user: req.session.user_id });
    let cartCount=0; 
    let wishCount=0;
    if (cart) {
      cartCount = cart.products.length;
    }
    if (wish) {
      wishCount = wish.products.length;
    }

    const userId = req.session.user_id;
    const orderData = await Order.find({ userId: userId}).sort({date: -1});
    res.render("orders", {
      name: req.session.name,
      orders: orderData,
      cartCount,
      wishCount,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//========================================FULL DETAILS OF EACH ORDERS IN USER SIDE=====================

const userOderDetails = async (req, res) => {
  try {
    const id = req.query.id;
    const orderedProduct = await Order.findOne({ _id: id }).populate(
      "products.productId"
    );
    const currentDate = new Date();
    const deliveryDate = orderedProduct.deliveryDate;
    const timeDiff = currentDate - deliveryDate;
    const daysDiff = Math.floor(timeDiff / (24 * 60 * 60 * 1000));

    const cart = await Cart.findOne({ userId: req.session.user_id });
    const wish = await Wishlist.findOne({ user: req.session.user_id });
    let cartCount=0; 
    let wishCount=0;
    if (cart) {
      cartCount = cart.products.length;
    }
    if (wish) {
      wishCount = wish.products.length;
    }

    res.render("orderedProduct", {
      name: req.session.name,
      orders: orderedProduct,
      daysDiff: daysDiff,
      wishCount,
      cartCount,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//====================================DELIVER THE PRODUCT ADMIN SIDE===================================
const delivered = async (req, res) => {
  try {
    const orderId = req.query.id;
    const order = await Order.updateOne(
      { _id: orderId },
      { $set: { status: "delivered", deliveryDate: new Date() } }
    );
    if (order) {
      console.log("delivered");
      res.redirect("/admin/showOrder");
    } else {
      console.log("not delivered");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//===========================================RETURN THE PRODUCT WITHIN 7 DAYS===========================

const productReturn = async (req, res) => {
  try {
    const orderId = req.body.orderid;
    const returnReason = req.body.reason;
    const returnAmount = req.body.totalPrice;
    const amount = parseInt(returnAmount);
    const orderData = await Order.findOne({ _id: orderId });
    const products = orderData.products;
    const result = await User.findOneAndUpdate(
      { _id: req.session.user_id },
      {
        $inc: { wallet: amount },
        $push: {
          walletHistory: {
            date: new Date(),
            amount: amount,
            reason: "Returned Product Amount Credited.",
          },
        },
      },
      { new: true }
    );
    if (result) {
      const updatedData = await Order.updateOne(
        { _id: orderId },
        { $set: { returnReason: returnReason, status: "Returned" } }
      );
      if (updatedData) {
        for (let i = 0; i < products.length; i++) {
          let pro = products[i].productId;
          let count = products[i].count;
          await Product.findOneAndUpdate(
            { _id: pro },
            { $inc: { quantity: count } }
          );
        }
        res.redirect("/orders");
      } else {
        console.log("order not updated");
      }
    } else {
      console.log("user not found");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//========================DOWNLOAD ORDER INVOICE============================

const orderInvoice = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.session.user_id;
    const userData = await User.findOne({ _id: user });
    const orderData = await Order.findOne({ _id: id }).populate(
      "products.productId"
    );
    const date = new Date()
    
    data = {
      order: orderData,
      user: userData,
      date
    };

    const filepathName = path.resolve(__dirname, "../views/user/invoice.ejs");

    const html = fs.readFileSync(filepathName).toString();
    const ejsData = ejs.render(html, data);

    const browser = await puppeteer.launch({ headless: "new"});
    const page = await browser.newPage();
    await page.setContent(ejsData, { waitUntil: "networkidle0"});
    const pdfBytes = await page.pdf({ format: "letter" });
    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename= order invoice.pdf"
    );
    res.send(pdfBytes);

  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  placeOrder,
  successPage,
  showOrder,
  loadProductdetails,
  userOrders,
  userOderDetails,
  verifyPayment,
  orderCancel,
  delivered,
  productReturn,
  orderInvoice,
};
