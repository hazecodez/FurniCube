const Cart = require('../models/cartModel')

const inStock = async(req,res,next)=>{
    try {
        const cartData = await Cart.findOne({
            userId: req.session.user_id,
          }).populate("products.productId");
        const products = cartData.products;
        
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

            if(inStock != true){
                req.session.inStock = true;
                res.redirect('/checkOut')
            }else{
                next()
            }
    } catch (error) {
        
    }
}

module.exports = {
    inStock
}