const mongoose=require('mongoose')

const userSchema=mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    number:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_verified:{
        type:Number,
        default:0
    },
    is_admin:{
        type:Number,
        default:0
    },
    is_block:{
        type:Number,
        default:0
    },
    token:{
        type: String,
        default: ''
    },
    wallet:{
        type:Number,
        default:0
    },
    walletHistory:[{
        date:{
            type:Date
        },
        amount:{
            type:Number,
        },
        reason:{
            type: String,
        }
    }]
})

const User=mongoose.model("user",userSchema)

module.exports = User;