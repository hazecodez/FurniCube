const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Sharp = require("sharp");
const fs = require("fs");
const Cloudinary = require("cloudinary");
const multer = require("../middlewares/multer");
const { log } = require("console");
const path = require("path");
const Cart = require('../models/cartModel')
const Wishlist = require('../models/wishlistModel')

//======================LOAD PRODUCT MANAGEMENT IN ADMIN SIDE===================

const product = async (req, res) => {
  try {
    req.session.require = false;
    req.session.proNameAlready = false;
    req.session.lowPrice = false;
    req.session.quantity = false;
    const productData = await Product.find({});
    res.render("product", { products: productData });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//============================LOAD ADD PRODUCT PAGE=============================

const loadAddProduct = async (req, res) => {
  try {
    let nameAlready = req.session.proNameAlready;
    const catData = await Category.find({ blocked: 0 });
    res.render("addProduct", { catData, nameAlready });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//=============================ADD PRODUCT WITH FULL DETAILS========================

const addProduct = async (req, res) => {
  try {
    const already = await Product.findOne({ name: req.body.name });
    if(already){
      req.session.proNameAlready = true;
      res.redirect('/admin/addProduct')
    }else{
      let details = req.body;
      const files = await req.files;

      const img = [
        files.image1[0].filename,
        files.image2[0].filename,
        files.image3[0].filename,
        files.image4[0].filename,
      ];

      for (let i = 0; i < img.length; i++) {
        await Sharp("public/products/images/" + img[i])
          .resize(500, 500)
          .toFile("public/products/crop/" + img[i]);
      }

      let product = new Product({
        name: details.name,
        price: details.price,
        quantity: details.quantity,
        category: details.category,
        description: details.description,
        blocked: 0,
        "images.image1": files.image1[0].filename,
        "images.image2": files.image2[0].filename,
        "images.image3": files.image3[0].filename,
        "images.image4": files.image4[0].filename,
      });

      let result = await product.save();
      res.redirect("/admin/product");
    }
    
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//============================PRODUCT DETAILS VIEW PAGE IN USER SIDE=====================

const productView = async (req, res) => {
  try {
    const viewProduct = await Product.findOne({ _id: req.query.id });
    const cart = await Cart.findOne({userId:req.session.user_id})
    const wish = await Wishlist.findOne({user:req.session.user_id})
    let cartCount=0; 
    let wishCount=0;
    if(cart){cartCount = cart.products.length}
    if(wish){wishCount = wish.products.length}

    if (viewProduct) {
      const products = await Product.find({ blocked: 0 });
      res.render("userProduct", {
        name: req.session.name,
        products: products,
        view: viewProduct,
        cartCount,wishCount
      });
    } else {
      res.status(404).render("404");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//=============================LIST AND UNLIST PRODUCTS ADMIN SIDE======================

const blockProduct = async (req, res) => {
  try {
    const blockedPro = await Product.findOne({ _id: req.query.id });
    if (blockedPro.blocked == 0) {
      await Product.updateOne({ _id: req.query.id }, { $set: { blocked: 1 } });
      res.redirect("/admin/product");
    } else {
      await Product.updateOne({ _id: req.query.id }, { $set: { blocked: 0 } });
      res.redirect("/admin/product");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//============================LOAD UPDATE PRODUCT PAGE ADMIN SIDE=================================

const editProductPage = async (req, res) => {
  try {
    const catData = await Category.find({ blocked: 0 });
    const editProducts = await Product.findOne({ _id: req.query.id });
    res.render("editProduct", { product: editProducts, catData });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//===================================UPDATING PRODUCTS ADMIN SIDE=========================

const editedProduct = async (req, res) => {
  try {
    let details = req.body;
    let imagesFiles = await req.files;
    let currentData = await Product.findOne({ _id: req.query.id });

    const img = [
      imagesFiles.image1 ? imagesFiles.image1[0].filename : currentData.images.image1,
      imagesFiles.image2 ? imagesFiles.image2[0].filename : currentData.images.image2,
      imagesFiles.image3 ? imagesFiles.image3[0].filename : currentData.images.image3,
      imagesFiles.image4 ? imagesFiles.image4[0].filename : currentData.images.image4,
    ];

    for (let i = 0; i < img.length; i++) {
      await Sharp("public/products/images/" + img[i])
        .resize(500, 500)
        .toFile("public/products/crop/" + img[i]);
    }

    let img1, img2, img3, img4;

    img1 = imagesFiles.image1 ? imagesFiles.image1[0].filename : currentData.images.image1;
    img2 = imagesFiles.image2 ? imagesFiles.image2[0].filename : currentData.images.image2;
    img3 = imagesFiles.image3 ? imagesFiles.image3[0].filename : currentData.images.image3;
    img4 = imagesFiles.image4 ? imagesFiles.image4[0].filename : currentData.images.image4;

    let update = await Product.updateOne(
      { _id: req.query.id },
      {
        $set: {
          name: details.name,
          price: details.price,
          quantity: details.quantity,
          category: details.category,
          description: details.description,
          "images.image1": img1,
          "images.image2": img2,
          "images.image3": img3,
          "images.image4": img4,
        },
      }
    );
    res.redirect("/admin/product");
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};




module.exports = {
  loadAddProduct,
  product,
  addProduct,
  productView,
  blockProduct,
  editProductPage,
  editedProduct,
};
