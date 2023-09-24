const User = require('../models/userModel')
const Category = require('../models/categoryModel')
const Admin = require('../models/adminModel')
const bcrypt = require('bcrypt')
const Product = require('../models/productModel')


// get admin page
const loadAdmin = async(req,res)=>{
    try {
        res.render('dashboard')
    } catch (error) {
        console.log(error.message);
        res.status(404).render("404")
    }
}
// get login page
const loadLogin = async(req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message);
        res.status(404).render("404")
    }
}
//load user management
const usersList = async(req,res)=>{
    try {
        const usersData = await User.find({is_admin:0})
        res.render('userDetails',{users:usersData})
    } catch (error) {
        console.log(error.message);
        res.status(404).render("404")
    }
}

//load category management
const category = async(req,res)=>{
    try {
        const categories = await Category.find()
        res.render('category',{cats:categories})
    } catch (error) {
        console.log(error.message);
        res.status(404).render("404")
    }
}

//admin logout
const adminLogout = async(req,res)=>{
    try {
        req.session.destroy()
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
        res.status(404).render("404")
    }
}

//admin login
const adminLogin = async(req,res)=>{
    try {
        const email= req.body.email
        const password= req.body.password
        const adminData= await User.findOne({email:email})

        if(adminData){
            if(adminData.is_admin==1){
                const passwordMatch = await bcrypt.compare(password, adminData.password)
                if(passwordMatch){
                    req.session.admin_id = adminData._id
                    
                    res.redirect('/admin/home')
                }else{
                    res.render('login',{message:'Wrong password..!!'})
                }
            }else{
                res.render('login',{message:"You aren't Admin"})
            }
        }else{
            res.render('login',{message:'Entered email not exist.'})
        }
    } catch (error) {
        console.log(error.message);
        res.status(404).render("404")
    }
}

// block and unblock user
const blockUser= async(req,res)=>{
    try {
        const blockedUser= await User.findOne({_id: req.query.id})
        if(blockedUser.is_block==0){
            await User.updateOne({_id: req.query.id},{$set:{is_block:1}})
            res.redirect('/admin/userDetails')
        }else{
            await User.updateOne({_id: req.query.id},{$set:{is_block:0}})
            res.redirect('/admin/userDetails')
        }
    } catch (error) {
        console.log(error.message);
        res.status(404).render("404")
    }
}

//block and unblock categories
const blockCat= async (req,res)=>{
    try {
        const blockedCat = await Category.findOne({_id:req.query.id})
        if(blockedCat.blocked==0){
            await Category.updateOne({_id: req.query.id},{$set:{blocked:1}})
            res.redirect('/admin/category')
        }else{
            await Category.updateOne({_id:req.query.id},{$set:{blocked:0}})
            res.redirect('/admin/category')
        }
    } catch (error) {
        console.log(error.message);
        res.status(404).render("404")
    }
}
//load add category
const loadAddcategory = async(req,res)=>{
    try {
        res.render('addCategory')
    } catch (error) {
        console.log(error.message);
        res.status(404).render("404")
    }
}

//add a category to DB
const addCate = async(req,res)=>{
    try {
        const data = new Category({
            name:req.body.catName
        })
        const already = await Category.findOne({name: data.name})
        if(already){
            res.render('addCategory',{message: 'Entered category is already exist.'})
        }else{
            const catData = await data.save()
            res.redirect('/admin/category')
        }
    } catch (error) {
        console.log(error.message);
        res.status(404).render("404")
    }
}

//edit category page
const editCate = async(req,res)=>{
    try {
        const catsId = req.query.id
        const category = await Category.findOne({_id: catsId})
        res.render('editCategory',{cats:category})
        
    } catch (error) {
        console.log(error.message);
        res.status(404).render("404")
    }
}

//update category
const updateCate = async(req,res)=>{
    try {
        const cateId = req.query.id
        const updateCate = await Category.updateOne({_id:cateId},{$set:{name:req.body.catName}})
        if(updateCate){
            
            res.redirect('/admin/category')
        }else{
            res.render('editCategory',{message:'There is an error occured, try again!'})
        }
    } catch (error) {
        console.log(error.message);
        res.status(404).render("404")
    }
}





module.exports={
    loadAdmin,
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
    adminLogout
    
}