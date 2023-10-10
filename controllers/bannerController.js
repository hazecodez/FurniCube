const Banner = require('../models/bannerModel')


//====================LOAD BANNER ADD BANNER PAGE=========================

const loadAddBanner = async(req,res)=> {
    try {
        
        res.render('addBanners')
    } catch (error) {
        console.log(error.message);
    }
}

//========================BANNER ADDING TO DB===============================

const addBanner = async(req,res)=> {
    try {
        // const image = req.file.filename
        let banner = new Banner({
            title: req.body.title,
            description: req.body.description,
            image:req.file.filename ,
            status: true
          });
      
          let result = await banner.save();

          if(result){
            res.redirect('/admin/bannerDetails')
          }else{
            console.log('not added in db');
          }

        
    } catch (error) {
        console.log(error.message);
    }
}

//===========================LOAD BANNER LIST IN ADMIN SIDE====================

const loadBannerPage = async(req,res)=> {
    try {
        const banners = await Banner.find()
        res.render('bannerDetails',{banner:banners})
    } catch (error) {
        console.log(error.message);
    }
}

//===========================BLOCK AND UNBLOCK BANNER===========================

const blockBanner = async(req,res)=> {
    try {
        const Id = req.query.id;
        const banner = await Banner.findOne({_id:Id})
        if(banner.status == true){
            await Banner.updateOne({_id:Id},{$set:{status: false}})
        }else{
            await Banner.updateOne({_id:Id},{$set:{status: true}})
        }
        if(banner){
            res.redirect('/admin/bannerDetails')
        }else{
            console.console.log('not get');
        }
    } catch (error) {
        console.log(error.message);
    }
}

//===============================EDIT BANNER DETAILS=============================
 const editBannerPage = async(req,res)=> {
    try {
        const bannerId = req.query.id
        const banner = await Banner.findOne({_id:bannerId})
        res.render('editBanner',{banner:banner})
    } catch (error) {
        console.log(error.message);
    }
 }

 //==============================UPDATE BANNER DETAILS===========================
 const editBanner = async(req,res)=> {
    try {
        const updated = await Banner.updateOne({_id:req.query.id},{$set:{
            title: req.body.title,
            description: req.body.description,
            image:req.file.filename
        }})
        if(updated){
            res.redirect('/admin/bannerDetails')
        }else{
            console.log('not updated');
        }
        
    } catch (error) {
        console.log(error.message);
    }
 }

module.exports= {
    addBanner,
    loadBannerPage,
    loadAddBanner,
    blockBanner,
    editBannerPage,
    editBanner

}