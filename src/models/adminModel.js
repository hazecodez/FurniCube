const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  password: {
    type: Number,
    required:true
  },
  
  email:{
    type:String,
    required:true
  },

  is_admin:{
    type:Number,
    default:0
  },
});

module.exports = mongoose.model("admin", adminSchema);