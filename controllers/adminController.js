const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Admin = require("../models/adminModel");
const bcrypt = require("bcrypt");
const Product = require("../models/productModel");
const Order = require('../models/orderModel')

//===========================404 ERROR PAGE=====================================
const loadError = async (req, res) => {
  try {
    res.status(404).render("404");
  } catch (error) {
    console.log(error.message);
  }
};

//=======================SHOW DASHBOARD IN ADMIN SIDE============================

const loadAdmin = async(req,res)=> {
  try {
    const users = await User.find({is_block:0});
    const products = await Product.find({blocked: 0});
    const tot_order = await Order.find();
    const sales = await Order.countDocuments({ status: 'delivered' })
    
    const monthRev = await Order.aggregate([
      {
        $match: {
          status: "delivered" 
        }
      },
      {
        $project: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          totalAmount: 1
        }
      },
      {
        $group: {
          _id: { year: '$year', month: '$month' },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ])
    const monRev = monthRev[0].totalRevenue
    const totalRev = await Order.aggregate([
      {
        $match: {
          status: "delivered" 
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ])
    const totalRevenue = totalRev[0].totalRevenue
    res.render('dashboard',{users,products,tot_order,totalRevenue,monRev,sales})
  } catch (error) {
    console.log(error.message);
  }
}

//==========================SALES REPORT IN ADMIN SIDE===============================

const salesReport = async (req, res) => {
  try {
    const users = await User.find({is_block:0});
    
    
    const orderData = await Order.aggregate([
      { $unwind: "$products" },
      { $match: { status: "delivered" } },
      { $sort: { date: -1 } },
      {
        $lookup: {
          from: "products",
          let: { productId: { $toObjectId: "$products.productId" } },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$productId"] } } }],
          as: "products.productDetails",
        },
      },
      {
        $addFields: {
          "products.productDetails": {
            $arrayElemAt: ["$products.productDetails", 0],
          },
        },
      },
    ]);

    
    

    res.render("salesReport", {
      order: orderData,users,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//=======================SALES REPORT SORTING BY YEAR MONTHLY ETC================

const saleSorting = async(req,res)=> {
  try {
      const id = req.params.id;
      
      const startDate = 86400000 * id;
      const currentDate = new Date();
      const order = await Order.aggregate([
        { $unwind: "$products" },
        {
          $match: {
            "status": "delivered",
            $and: [
              { "deliveryDate": { $gte: new Date(startDate) } },
              { "deliveryDate": { $lt: new Date(currentDate) } },
            ],
          },
        },
        { $sort: { "deliveryDate": -1 } },
        {
          $lookup: {
            from: "products",
            let: { productId: { $toObjectId: "$products.productId" } },
            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$productId"] } } }],
            as: "products.productDetails",
          },
        },
        {
          $addFields: {
            "products.productDetails": {
              $arrayElemAt: ["$products.productDetails", 0],
            },
          },
        },
      ]);
      // console.log(order);
      res.render('salesReport',{order})
  } catch (error) {
    console.log(error.message);
  }
}

//================================SHOW ADMIN LOGIN===============================

const loadLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};
//==========================SHOW USER MANAGEMENT=================================

const usersList = async (req, res) => {
  try {
    const usersData = await User.find({ is_admin: 0 });
    res.render("userDetails", { users: usersData });
  } catch (error) {
    console.log(error.message);
  }
};

//==========================SHOW CATEGORY MANGEMENT==============================

const category = async (req, res) => {
  try {
    const categories = await Category.find();
    res.render("category", { cats: categories });
  } catch (error) {
    console.log(error.message);
  }
};

//==============================ADMIN LOGOUT=====================================

const adminLogout = async (req, res) => {
  try {
    req.session.admin_id = false;
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

//===============================ADMIN LOGIN=====================================

const adminLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const adminData = await User.findOne({ email: email });

    if (adminData) {
      if (adminData.is_admin == 1) {
        const passwordMatch = await bcrypt.compare(
          password,
          adminData.password
        );
        if (passwordMatch) {
          req.session.admin_id = adminData._id;

          res.redirect("/admin/home");
        } else {
          res.render("login", { message: "Wrong password..!!" });
        }
      } else {
        res.render("login", { message: "You aren't Admin" });
      }
    } else {
      res.render("login", { message: "Entered email not exist." });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//===========================BLOCK AND UNBLOCK USER=============================

const blockUser = async (req, res) => {
  try {
    const blockedUser = await User.findOne({ _id: req.query.id });
    if (blockedUser.is_block == 0) {
      await User.updateOne({ _id: req.query.id }, { $set: { is_block: 1 } });
      res.redirect("/admin/userDetails");
    } else {
      await User.updateOne({ _id: req.query.id }, { $set: { is_block: 0 } });
      res.redirect("/admin/userDetails");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//=============================BLOCK AND UNBLOCK CATEGORIES=========================

const blockCat = async (req, res) => {
  try {
    const blockedCat = await Category.findOne({ _id: req.query.id });
    if (blockedCat.blocked == 0) {
      await Category.updateOne({ _id: req.query.id }, { $set: { blocked: 1 } });
      res.redirect("/admin/category");
    } else {
      await Category.updateOne({ _id: req.query.id }, { $set: { blocked: 0 } });
      res.redirect("/admin/category");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//================================LOAD ADD CATEGORY===================================

const loadAddcategory = async (req, res) => {
  try {
    res.render("addCategory");
  } catch (error) {
    console.log(error.message);
  }
};

//================================ADD CATEGORY TO DB==================================

const addCate = async (req, res) => {
  try {
    const name = req.body.catName;
    const data = new Category({
      name: req.body.catName,
    });
    const already = await Category.findOne({
      name: { $regex: name, $options: "i" },
    });
    if (already) {
      res.render("addCategory", {
        message: "Entered category is already exist.",
      });
    } else {
      const catData = await data.save();
      res.redirect("/admin/category");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//===========================LOAD CATEGORY PAGE=================================

const editCate = async (req, res) => {
  try {
    const catsId = req.query.id;
    const category = await Category.findOne({ _id: catsId });
    res.render("editCategory", { cats: category });
  } catch (error) {
    console.log(error.message);
  }
};

//============================UPADATE CATEGORY==================================

const updateCate = async (req, res) => {
  try {
    const cateId = req.query.id;
    const updateCate = await Category.updateOne(
      { _id: cateId },
      { $set: { name: req.body.catName } }
    );
    if (updateCate) {
      res.redirect("/admin/category");
    } else {
      res.render("editCategory", {
        message: "There is an error occured, try again!",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};




module.exports = {
  loadAdmin,
  salesReport,
  saleSorting,
  loadLogin,
  adminLogin,
  usersList,
  category,
  blockUser,
  loadAddcategory,
  addCate,
  blockCat,
  editCate,
  updateCate,
  adminLogout,
  loadError,
};
