const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
  },
  orderId: {
    type:String,
    unique:true,
    required:true
  },
  deliveryAddress: {
    type:String,
    required:true
  },
  date:{
    type:Date
  },
  product:[{
    productId : {
      type: mongoose.Schema.Types.ObjectId,
      ref:'Product',
      required:true
    },
    quantity: {
      type:Number,
      required:true
    },
    singleTotal: { 
      type:Number,
      required:true
    },
    singlePrice:{
      type:Number,
      required:true
    }
  }
  ],
  total:{
    type:Number
  },
  discount:{
    type:Number
  },
  paymentType:{
    type:String,
    required:true
  },
  coupon:{
    type:String
  },
  status:{
    type:String,
    default:'pending'
  },
  returnReason: {
    type: String
  }
})

module.exports = mongoose.model('order',orderSchema);