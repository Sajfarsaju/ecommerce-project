const mongoose = require('mongoose');

const bannerSchema = mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  description: {
    type:String,
    required:true
  },
  image:{
    type:String,
    required:true
  }
})

module.exports = mongoose.model('Banner',bannerSchema);