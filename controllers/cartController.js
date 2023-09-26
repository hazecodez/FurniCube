const User = require("../models/userModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Cart = require("../models/cartModel");

//===================================LOAD CART PAGE=========================

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
      }else{
        console.log('empty cart');
      }
    }else{
        console.log('no products in cart');
    }

    // const userData = await User.findOne({ _id: userId });
    // const cartData = await Cart.findOne({ user: userId }).populate(
    //   "product.productId"
    // );
    // if (cartData) {
    //   const products = cartData.product;
    //   if (products.length > 0) {
    //     const total = await Cart.aggregate([
    //       { $match: { user: userId } },

    //       { $unwind: "$product" },

    //       {
    //         $project: {
    //           price: "$product.price",
    //           quantity: "$product.quantity",
    //         },
    //       },

    //       {
    //         $group: {
    //           _id: null,
    //           total: {
    //             $sum: { $multiply: ["$product.price", "$product.quantity"] },
    //           },
    //         },
    //       },
    //     ]);

    //     const Total = total[0].total;
    //     res.render("cart", { user: name, products: products, Total, userId });
    //   } else {
    //     res.render("cart", { user: name, products: undefined });
    //   }
    // } else {
    //   res.render("cart", { user: name });
    // }
  } catch (error) {
    console.log(error.message);
    res.status(404).render("404");
  }
};

//================================PRODUCT ADDING TO CART=============================

const addToCart = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userData = await User.findOne({ _id: userId });

    const proId = req.body.id;
    const productData = await Product.findOne({ _id: proId });
    const productQuantity = productData.quantity;

    if (userId === undefined) {
      res.json({ login: true, message: "Please login and continue shopping!" });
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

module.exports = { showCart, addToCart };
