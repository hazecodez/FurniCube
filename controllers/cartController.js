const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Address = require("../models/addressModel");

//===================================LOAD CART PAGE=============================================

const showCart = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userName = req.session.name;
    const cartData = await Cart.findOne({
      userId: userId,
    }).populate("products.productId");

    const session = req.session.user_id;
    if (cartData) {
      if (cartData.products.length > 0) {
        const products = cartData.products;

        const total = await Cart.aggregate([
          { $match: { userId: req.session.user_id } },
          { $unwind: "$products" },
          {
            $group: {
              _id: null,
              total: {
                $sum: {
                  $multiply: ["$products.productPrice", "$products.count"],
                },
              },
            },
          },
        ]);

        const Total = total.length > 0 ? total[0].total : 0;
        const totalamount = Total;
        const userId = userName._id;
        const userData = await User.find();

        res.render("cart", {
          name: req.session.name,
          products: products,
          Total: Total,
          userId,
          session,
          totalamount,
          user: userName,
        });
      } else {
        res.render("cart", { name: req.session.name });
        console.log("empty cart");
      }
    } else {
      res.render("cart", { name: req.session.name });
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
      res.redirect('/')
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
    const session = req.session.user_id;
    const addressData = await Address.findOne({ user: req.session.user_id });
    const userData = await User.findOne({ _id: req.session.user_id });
    const cartData = await Cart.findOne({
      userId: req.session.user_id,
    }).populate("products.productId");
    const products = cartData.products;

    const total = await Cart.aggregate([
      { $match: { userId: req.session.user_id } },
      { $unwind: "$products" },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $multiply: ["$products.productPrice", "$products.count"],
            },
          },
        },
      },
    ]);

    if (req.session.user_id) {
      if (addressData) {
        if (addressData.address.length > 0) {
          const address = addressData.address;
          const Total = total.length > 0 ? total[0].total : 0;
          const totalamount = Total;
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
          });
        } else {
          res.redirect('/')
          console.log("first");
        }
      } else {
        res.redirect('/profile')
        console.log("second");
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
