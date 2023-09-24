const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Sharp = require("sharp");
const fs = require("fs");
const Cloudinary = require("cloudinary");
const multer = require("../middlewares/multer");
const { log } = require("console");

//load product management
const product = async (req, res) => {
  try {
    const productData = await Product.find({});
    res.render("product", { products: productData });
  } catch (error) {
    console.log(error.message);
    res.status(404).render("404")
    
  }
};

//load addProduct page
const loadAddProduct = async (req, res) => {
  try {
    const catData = await Category.find({ blocked: 0 });
    res.render("addProduct", { catData });
  } catch (error) {
    console.log(error.message);
    res.status(404).render("404")
  }
};


//product details adding
const addProduct = async (req, res) => {

  const img = [];

  try {
    for (let i = 0; i < req.files.length; i++) {
      img.push(req.files[i].filename);
      await Sharp("public/product/" + req.files[i].filename)
        .resize(500, 500)
        .toFile("public/product/img/" + req.files[i].filename);
    }
    const productData = new Product({
      name: req.body.name,
      price: req.body.price,
      quantity: req.body.quantity,
      category: req.body.category,
      description: req.body.description,
      image: img,
      blocked: 0,
    });
    await productData.save();
    res.redirect("/admin/product");
  } catch (error) {
    console.log(error.message);
    res.status(404).render("404")
  }
};


//product details view page
const productView = async(req,res)=>{
  try {
    const viewProduct = await Product.findOne({_id:req.query.id})
    if(viewProduct){
      const products = await Product.find({blocked: 0})
      res.render('userProduct',{name:req.session.name , products:products, view:viewProduct})
    }else{
      res.status(404).render("404")
    }
    
  } catch (error) {
    res.status(404).render("404")
    console.log(error.message);
  }
}

//delete product
const deleteProduct = async(req,res)=> {
  try {
      const deleted = await Product.deleteOne({_id:req.query.id})
      if(deleted){
        res.redirect('/admin/product')
      }
      

  } catch (error) {
      console.log(error.message);
      res.status(404).render("404")
  }
}

//edit product page
const editProductPage = async(req,res)=> {
  try {
    const catData = await Category.find({ blocked: 0 });
    editProducts = await Product.findOne({_id:req.query.id})
    res.render('editProduct',{product:editProducts , catData})
  } catch (error) {
    console.log(error.message);
    res.status(404).render("404")
  }
}

const editedProduct = async(req,res)=> {
  try {
    
    const proId = req.query.id
    const editData = {
      name: req.body.name,
      price: req.body.price,
      quantity: req.body.quantity,
      category: req.body.category,
      description: req.body.description,
      blocked: 0,
    };
    const updated = await Product.updateOne({_id:proId},{$set:editData})
    if(updated){
      console.log(editData);
      res.redirect("/admin/product");
    }else{
      
    }

  } catch (error) {
    console.log(error.message);
    res.status(404).render("404")
  }
}

module.exports = {
  loadAddProduct,
  product,
  addProduct,
  productView,
  deleteProduct,
  editProductPage,
  editedProduct
};
