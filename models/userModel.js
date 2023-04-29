const mongoose = require('mongoose');

const userSchema = mongoose.Schema({

  name:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true
  },
  password:{
    type:String,
    required:true
  },
  mobile:{
    type:String,
    required:true
  },
  date:{
    type:String,
    // required:true
  },
  status:{
    type:Boolean,
    required:false,
    default:true
  },
  address:[{
    name:{
      type:String,
      required:true
    },
    housename:{
      type:String,
      required:true
    },
    street:{
      type:String,
      required:true
    },
    district:{
      type:String,
      required:true
    },
    state:{
      type:String,
      required:true
    },
    pincode:{
      type:String,
      required:true
    },
    country:{
      type:String,
      required:true
    },
    phone:{
      type:String,
      required:true
    },
  }],
  wishlist:[{
    product:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'Product',
      required: true
    }
  }],
  cart: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref:'Product',
      required:true
    },
    quantity:{
      type:Number,
      default:1
    },
    productTotalPrice:{
      type:Number
    }
  }],
  cartTotalPrice:{
    type:Number,
    default:0
  },
  wallet:{
    type:Number,
    default:0
  },
  is_verified:{
    type:Number,
    default:0
  },
  token:{
    type:String,
    default:''
  },
  
});

module.exports = mongoose.model('User',userSchema);