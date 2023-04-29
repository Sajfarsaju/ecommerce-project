const mongoose = require('mongoose');
const couponSchema = mongoose.Schema({

  code:{
    type:String,
    required:true,
    unique:true
  },
  maxDiscount:{
    type:String,
    required:true
  },
  expirydate:{
    type:Date,
    required:true
  },
  minPurchaseAmount:{
    type:Number,
    required:true
  },
  percentage:{
    type:Number,
    required:true,
    min:0,
    max:100,
  },
  userUsed:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  }

});

module.exports = mongoose.model('coupon',couponSchema);