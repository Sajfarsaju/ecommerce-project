const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({

  name:{
    type:String,
    required:true
  },
  image:{
    type:Array,
    required:true
  },
  category:{
    type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true
  },
  description:{
    type:String,
    required:true
    
  },
  status:{
    type:Boolean,
    required:false,
    default:true
  },
  stock:{
    type:Number,
    required:true
  },
  discount:{
    type:Number,
    default:0
   },
   offerStatus:{
    type:Boolean,
    default:true
   },
  discountPrice:{
    type:Number,
    default:0
  },
  price:{
    type:Number,
    required:true
  },
})

module.exports = mongoose.model('Product',productSchema);