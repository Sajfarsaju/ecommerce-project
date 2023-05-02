const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({

  name:{
    type:String,
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
  created_at:{
    type:Date,
    default:Date.now()
  },
  list:{
    type:Number,
    required:false
  },
  discount:{
    type:Number,
    default:0
  }

});

module.exports = mongoose.model('Category',categorySchema);