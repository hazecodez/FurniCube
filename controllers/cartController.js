const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Address = require("../models/addressModel");
const Wishlist = require('../models/wishlistModel')

//===================================LOAD CART PAGE=============================================

const showCart = async (req, res) => {
  try {
    req.session.outProduct = false;
    req.session.outStock = false;
    const userId = req.session.user_id;
    const userName = req.session.name;
    const cartData = await Cart.findOne({
      userId: userId,
    }).populate("products.productId");

    const cart = await Cart.findOne({userId:req.session.user_id})
    const wish = await Wishlist.findOne({user:req.session.user_id})
    let cartCount=0; 
    let wishCount=0;
    if(cart){cartCount = cart.products.length}
    if(wish){wishCount = wish.products.length}
    


    const session = req.session.user_id;
    if (cartData) {
      if (cartData.products.length > 0) {
        const products = cartData.products;

        // const total = await Cart.aggregate([
        //   { $match: { userId: req.session.user_id } },
        //   { $unwind: "$products" },
        //   {
        //     $group: {
        //       _id: null,
        //       total: {
        //         $sum: {
        //           $multiply: ["$products.productPrice", "$products.count"],
        //         },
        //       },
        //     },
        //   },
        // ]);
        let total = 0;
        for(let i=0;i<products.length;i++){
          total += products[i].totalPrice
        }

        // const Total = total.length > 0 ? total[0].total : 0;
        const totalamount = total;
        const userId = userName._id;
        const userData = await User.find();
        
        res.render("cart", {
          name: req.session.name,
          products: products,
          Total: total,
          userId,
          session,
          totalamount,
          user: userName,
          cartCount,wishCount
        });
      } else {
        res.render("cart", { name: req.session.name, cartCount,wishCount });
        console.log("empty cart");
      }
    } else {
      res.render("cart", { name: req.session.name, cartCount,wishCount });
      console.log("no products in cart");
    }
  } catch (error) {
    console.log(error.message);
    res.status(404).render("404");
  }
};

//================================PRODUCT ADDING TO CART==================================================

const addToCart = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userData = await User.findOne({ _id: userId });

    const proId = req.body.id;
    const productData = await Product.findOne({ _id: proId });
    const productQuantity = productData.quantity;

    if (userId === undefined) {
      res.json({ login: true, message: "Please login and continue shopping!" });
      res.redirect("/");
    }
    const cartData = await Cart.findOneAndUpdate(
      { userId: userId },
      {
        $setOnInsert: {
          userId: userId,
          userName: userData.name,
          products: [],
        },
      },
      { upsert: true, new: true }
    );
    const updatedProduct = cartData.products.find(
      (product) => product.productId === proId
    );
    const updatedQuantity = updatedProduct ? updatedProduct.count : 0;
    if (updatedQuantity + 1 > productQuantity) {
      return res.json({
        success: false,
        message: "Quantity limit reached!",
      });
    }

    const price = productData.price;
    const total = price;

    if (updatedProduct) {
      await Cart.updateOne(
        { userId: userId, "products.productId": proId },
        {
          $inc: {
            "products.$.count": 1,
            "products.$.totalPrice": total,
          },
        }
      );
    } else {
      cartData.products.push({
        productId: proId,
        productPrice: total,
        totalPrice: total,
      });
      await cartData.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.status(404).render("404");
  }
};

//==========================REMOVE PRODUCTS FROM CART===========================================

const removeCartItem = async (req, res, next) => {
  try {
    const userId = req.session.user_id;
    const proId = req.body.product;
    const cartData = await Cart.findOne({ userId: userId });

    if (cartData) {
      await Cart.findOneAndUpdate(
        { userId: userId },
        {
          $pull: { products: { productId: proId } },
        }
      );
      res.json({ success: true });
    }
  } catch (error) {
    console.log(error.message);
    res.status(404).render("404");
  }
};

//========================================QUANTITY UPDATION==============================

const quantityUpdation = async (req, res) => {
  try {
    const userData = req.session.user_id;
    const proId = req.body.product;
    let count = req.body.count;
    count = parseInt(count);

    const cartData = await Cart.findOne({ userId: userData });
    const product = cartData.products.find(
      (product) => product.productId === proId
    );
    const productData = await Product.findOne({ _id: proId });
    const productQuantity = productData.quantity;
    const updatedCartData = await Cart.findOne({ userId: userData });
    const updatedProduct = updatedCartData.products.find(
      (product) => product.productId === proId
    );
    const updatedQuantity = updatedProduct.count;

    if (count > 0) {
      if (updatedQuantity + count > productQuantity) {
        res.json({ success: false, message: "Quantity limit reached!" });
        return;
      }
    } else if (count < 0) {
      // Quantity is being decreased
      if (updatedQuantity <= 1 || Math.abs(count) > updatedQuantity) {
        await Cart.updateOne(
          { userId: userData },
          { $pull: { products: { productid: proId } } }
        );
        res.json({ success: true });
        return;
      }
    }

    const cartdata = await Cart.updateOne(
      { userId: userData, "products.productId": proId },
      { $inc: { "products.$.count": count } }
    );
    const updateCartData = await Cart.findOne({ userId: userData });
    const updateProduct = updateCartData.products.find(
      (product) => product.productId === proId
    );
    const updateQuantity = updateProduct.count;
    const productPrice = productData.price;

    const productTotal = productPrice * updateQuantity;
    await Cart.updateOne(
      { userId: userData, "products.productId": proId },
      { $set: { "products.$.totalPrice": productTotal } }
    );
    res.json({ success: true });
  } catch (error) {
    next(err);
  }
};

//=============================LOAD CHECKOUT==================================

const loadCheckOut = async (req, res) => {
  try {
    const outPro = req.session.outProduct;
    const outStock = req.session.outStock;
    const session = req.session.user_id;
    const addressData = await Address.findOne({ user: req.session.user_id });
    let address;
    if(addressData){
      address = addressData.address 
    }
    const userData = await User.findOne({ _id: req.session.user_id });
    const cartData = await Cart.findOne({
      userId: req.session.user_id,
    }).populate("products.productId");
    const products = cartData.products;
    const applied = cartData.applied;
    const cart = await Cart.findOne({userId:req.session.user_id})
    const wish = await Wishlist.findOne({user:req.session.user_id})
    let cartCount=0; 
    let wishCount=0;
    if(cart){cartCount = cart.products.length}
    if(wish){wishCount = wish.products.length} 


    // const total = await Cart.aggregate([
    //   { $match: { userId: req.session.user_id } },
    //   { $unwind: "$products" },
    //   {
    //     $group: {
    //       _id: null,
    //       total: {
    //         $sum: {
    //           $multiply: ["$products.productPrice", "$products.count"],
    //         },
    //       },
    //     },
    //   },
    // ]);
    let total = 0;
        for(let i=0;i<products.length;i++){
          total += products[i].totalPrice
        }
  

    let stock = [];
    let countCart = [];

    for (let i = 0; i < products.length; i++) {
      stock.push(cartData.products[i].productId.quantity);
      countCart.push(cartData.products[i].count);
    }
    let inStock = true;
    let proIndex = 0;

    for (let i = 0; i < stock.length; i++) {
      if (stock[i] > countCart[i] || stock[i] == countCart[i]) {
        inStock = true;
      } else {
        inStock = false;
        proIndex = i;
        break;
      }
    }

    const proName = cartData.products[proIndex].productId.name;

    if (req.session.user_id) {
      if (inStock === true) {
            const Total = total;
            const totalamount = total;
            const userId = userData._id;

            res.render("checkOut", {
              name: req.session.name,
              products: products,
              Total: Total,
              userId,
              session,
              totalamount,
              user: userData,
              address,
              cartCount,wishCount,outPro,outStock,applied
            });
      } else {
        res.render("cart", { message: proName, name: req.session.name, cartCount,wishCount });
      }
    } else {
      res.redirect("/loadLogin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  showCart,
  addToCart,
  removeCartItem,
  quantityUpdation,
  loadCheckOut,
};
