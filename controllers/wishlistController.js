const Wishlist = require('../models/wishlistModel')
const Cart = require('../models/cartModel')


//===========================SHOW WISHLIST PAGE=========================
const showWishlist = async(req,res)=> {
    try {
        const cart = await Cart.findOne({userId:req.session.user_id})
        const wish = await Wishlist.findOne({user:req.session.user_id})
        let cartCount; 
        let wishCount;
        if(cart){cartCount = cart.products.length}
        if(wish){wishCount = wish.products.length}

        const wishlist = await Wishlist.findOne({user:req.session.user_id}).populate("products.productId")
        const products = wishlist.products;
        res.render('wishlist',{name:req.session.name,products:products , wishCount,cartCount})

    } catch (error) {
        console.log(error.message);
    }
}

//==================ADD PRODUCT TO YOUR WISHLIST========================

const addToWishlist = async(req,res) => {
    try {
        const proId = req.body.id
        if(req.session.user_id){
           const already = await Wishlist.findOne({user:req.session.user_id})
           if(already){
            const proExist = already.products.some(product => product.productId.toString() === proId)
            if(!proExist){
                await Wishlist.updateOne(
                    {user:req.session.user_id},
                    {$push:
                        {products:
                            {productId:proId
                            }
                        }
                    })
                    res.json({success:true})
            }else{
                res.json({exist:true})
            }
            
           }else {
            const data = new Wishlist({
                user:req.session.user_id,
                products:[{
                    productId: proId
                }]
            })
            await data.save()
            res.json({success:true})
           }
        }else{
            res.json({login:true})
        }
    } catch (error) {
        console.log(error.message);
    }
}

//===========================REMOVE FROM WISHLIST===================================

const removeWishItem = async(req,res)=> {
    try {
        const proId = req.body.product;
        const wish = await Wishlist.findOne({user:req.session.user_id})
        if(wish){
            await Wishlist.findOneAndUpdate(
                { user: req.session.user_id },
                {
                  $pull: { products: { productId: proId } },
                }
              );
              res.json({remove:true})
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    showWishlist,
    addToWishlist,
    removeWishItem
}