const User = require("../models/userModel");
const product = require('../models/productModel');
const category = require('../models/categoryModel');
const Banner = require('../models/bannerModel');
const order = require('../models/orderModel');
const coupon = require('../models/couponModel');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const env = require("dotenv").config();
const session = require("express-session");
const crypto = require('crypto');
const Razorpay = require('razorpay')
require('dotenv').config();

const { default: mongoose } = require("mongoose");
const AccessToken = require("twilio/lib/jwt/AccessToken");
const productModel = require("../models/productModel");
const accountsid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountsid, authToken);

var instance = new Razorpay({
  key_id: process.env.YOUR_KEY_ID,
  key_secret: process.env.YOUR_KEY_SECRET
});


////////////// LOAD SIGNUP ///////////////////
const loadSignup = async (req, res, next) => {
  try {
    res.render("signup");
  } catch (error) {
    console.log(error.message);
    next(error.message);
  }
};
/////////////////////////END/////////////////////////////////


////////////// LOAD LOGIN //////////////
const loadLogin = async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Pragma', 'no-cache');
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};
/////////////////////////END/////////////////////////////////


////////////// LOAD HOME ///////////////////
const loadHome = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      const id = req.session.user_id._id;
      const userInfo = await User.findOne({ _id: id });
      const categoryData = await category.find({status:true})
      const productData = await product.find({}).populate('category')
      const bannerData = await Banner.find({})
      res.render("homePage", { user : userInfo, productInfo:productData, BannerData: bannerData, category: categoryData });
    } else {
      const UserInfo = await User.findOne({});
      const productData = await product.find({})
      const categoryData = await category.find({status:true})
      const bannerData = await Banner.find({})
      res.render("homePage", { User : UserInfo , productInfo:productData, BannerData: bannerData, category: categoryData });
    }
  } catch (error) {
    next(error.message);
  }
};
/////////////////////////END/////////////////////////////////


////////////// USER LOGOUT ///////////////////
const userlogOut = async(req,res,next)=>{
  try {
    
    const session = req.session.user_id = null;
    if(!session){
    res.redirect('/');
    }
  } catch (error) {
    console.log(error.message);
  }
}
/////////////////////////END/////////////////////////////////


////////////// LOGIN VERIFY ///////////////////
const verifyLogin = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    if (req.body.email.trim() == "" || req.body.password.trim() == "") {
      res.render("login", { message: "field cant be empty" });
    } else {
      const userCheck = await User.findOne({ email: email });
      if (userCheck) {
        if (userCheck.status == false) {
          res.render("login", { message: "Your account is blocked. Please contact support." });
        } else {
          const passwordMatch = await bcrypt.compare(password, userCheck.password);
          if (passwordMatch) {
            req.session.user_id = userCheck;
            res.redirect("/");
          } else {
            res.render("login", { message: "Invalid email or password" });
          }
        }
      } else {
        res.render("login", { message: "Invalid email or password" });
      }
    }
  } catch (error) {
    next(error.message);
  }
};
/////////////////////////END/////////////////////////////////


// const verifyLogin = async (req, res, next) => {
//   try {
//     const email = req.body.email;
//     const password = req.body.password;
//     if (req.body.email.trim() == "" || req.body.password.trim() == "") {
//       res.render("login", { message: "field cant be empty" });
//     } else {
//       const userCheck = await User.findOne({ email: email });
//       if (userCheck) {
//         if (userCheck.status == false) {
//           // if status is true, deny login and redirect to login page with error message
//           res.render("login", { message: "Your account is blocked. Please contact support." });
//         } else if (password == userCheck.password) {
//           req.session.user_id = userCheck;
//           res.redirect("/");
//         } else {
//           res.render("login", { message: "Invalid email or password" });
//         }
//       } else {
//         res.render("login", { message: "Invalid email or password" });
//       }
//     }
//   } catch (error) {
//     next(error.message);
//   }
// };


// const verifyLogin = async (req, res, next) => {
//   try {
//     const email = req.body.email;
//     const password = req.body.password;
//     if (req.body.email.trim() == "" || req.body.password.trim() == "") {

//       res.render("login", { message: "field cant be empty" });
//     } else {

//       const userCheck = await User.findOne({ email: email });
//       if (userCheck) {

//         req.session.user_id = userCheck;
//         if (password == userCheck.password) {
//           res.redirect("/");
//         }
//       }
//     }
//   } catch (error) {
//     next(error.message);
//   }
// };

////////////// USER INSERT ///////////////////
const insertUser = async (req, res, next) => {
  const mobile = req.body.mno
  try {
    // check if email, mobile, and username already exist
    const userWithEmail = await User.findOne({ email:req.body.email });
    const userWithMobile = await User.findOne({ mobile: req.body.mno });
    const userWithUsername = await User.findOne({ name: req.body.name });

    if (userWithEmail) {
      return res.render("signup", { message: "Email already exists." });
    }

    if (userWithMobile) {
      return res.render("signup", { message: "Mobile number already exists." });
    }

    if (userWithUsername) {
      return res.render("signup", { message: "Username already exists." });
    }
// 9i93
    // if email, mobile, and username are all unique, proceed with OTP verification
    const verifiedResponse = await client.verify.v2
      .services("VA14375573653861dacdafeb3a2714cb51")
      .verifications.create({
        to: `+91${mobile}`,
        channel: `sms`,
      });
    req.session.userData = req.body;
    res.render("otp");
  } catch (error) {
    next(error.message);
  }
};
/////////////////////////END/////////////////////////////////


// const insertUser = async (req, res, next) => {
//   req.session.userData = req.body;
//   mobile = req.body.mno;
//   try {
//     const verifiedResponse = await client.verify.v2
//       .services("VAece0858150921ab8f186d5507bf982f7")
//       .verifications.create({
//         to: `+91${mobile}`,
//         channel: `sms`,
//       });
//     res.render("otp");
//   } catch (error) {
//     next(error.message);
//   }
// };

////////////// VERIFY OTP ///////////////////
const otpVerify = async (req, res, next) => {
  const otp = req.body.otp;
  try {
    const info = req.session.userData;
    const verifiedResponse = await client.verify.v2
      .services("VA14375573653861dacdafeb3a2714cb51")
      .verificationChecks.create({
        to: `+91${info.mno}`,
        code: otp,
      });
    if (verifiedResponse.status === "approved") {
      const passwordHash = await bcrypt.hash(info.password, 10); // hash the password with bcrypt
      const newUserData = new User({
        name: info.name,
        email: info.email,
        mobile: info.mno,
        password: passwordHash, // use the hashed password
      });
      const userData = await newUserData.save();
      const user = await User.findOne({ name: info.name });
      if (userData) {
        req.session.user_id = user;
        res.redirect("/");
      } else {
        res.render("otp", { message: "Entered Otp is Incorrect" });
      }
    }
  } catch (error) {
    next(error.message);
  }
};
/////////////////////////END/////////////////////////////////


////////////// RESET PASSWORD ///////////////////
const resetPassword = async(req,res,next)=>{
  try {
    res.render('resetPassword')
  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END/////////////////////////////////


////////////// SEND RESET PASS ///////////////////
const   sendReset = async (req, res) => {
  try {
    console.log(req.body);
    if (!req.body.mno) {
      throw new Error("Mobile number is not defined");
    }

    const existingNumber = await User.findOne({ mobile: req.body.mno });

    if (existingNumber) {
      console.log("ok");
      req.session.phone = req.body.mno;

      res.render("changePassword");
      client.verify.v2
      // change service id
        .services("VAece0858150921ab8f186d5507bf982f7")
        .verifications.create({ to: `+91${req.body.mno}`, channel: "sms" })
        .then((verification) => {
          console.log(req.body.mno);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      console.log("ji");
      res.render("resetPassword", { msg: "This Number is Not Registered" });
    }
  } catch (error) {
    console.log(error);
  }
};
/////////////////////////END/////////////////////////////////


////////////// VERIFY RESET PASS ///////////////////
const verifyReset = async (req, res) => {
  const { otp, password } = req.body;
  const phone = req.session.phone;
  console.log("otp:", otp);
  console.log("phone:", phone);

  try {
    const verification_check = await client.verify.v2
    // change service id
      .services("VAece0858150921ab8f186d5507bf982f7")
      .verificationChecks.create({ to: `+91${phone}`, code: otp });

    if (verification_check.status === "approved") {
      const passwordMatch = await bcrypt.hash(password, 10);
      // const spassword = await securePassword(req.body.password);
      // await  User.updateOne({mobile:phone},{$set:{is_verified:1}})
      await User.updateOne(
        { mobile: phone },
        { $set: { password: passwordMatch } }
      );

      req.session.otpcorrect = true;
      res.redirect("/login");
      msg = "Verfied Succesfully,Login with account";
    } else {
      res.render("changePassword", { msg: "Incorrect Otp" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while verifying OTP.");
  }
}
////////////////////////////////////END////////////////////////////////////




// const otpVerify = async (req, res, next) => {
//   const otp = req.body.otp;
//   try {
//     const info = req.session.userData;
//     const verifiedResponse = await client.verify.v2
//       .services("VAece0858150921ab8f186d5507bf982f7")
//       .verificationChecks.create({
//         to: `+91${info.mno}`,
//         code: otp,
//       });
//     if (verifiedResponse.status === "approved") {
//       const newUserData = new User({
//         name: info.name,
//         email: info.email,
//         mobile: info.mno,
//         password: info.password,
//       });
//       const userData = await newUserData.save();
//       const user = await User.findOne({ name: info.name });
//       if (userData) {
//         req.session.user_id = user;
//         res.redirect("/");
//       } else {
//         res.render("otp", { message: "Entered Otp is Incorrect" });
//       }
//     }
//   } catch (error) {
//     next(error.message);
//   }
// };


////////////// ALL PRODUCTS ///////////////////
const allProducts = async(req,res,next)=> {
  try {
    let page = 1;
    if (req.query.page) {
      page = req.query.page
    }

    const limit = 12

    const productData = await product.find({status:true}).populate('category')
    .limit(limit * 1)
    .skip((page -1) * limit)
    .exec()

    const productCount = await product.find({}).countDocuments()


    let proCount = Math.ceil(productCount/limit)
    const categoryData = await category.find({status: true})
    
    if(req.session.user_id){
      const user = req.session.user_id;
      const userData = await User.findOne({_id:user._id})
      res.render('allProducts',{
        Product: productData,
        user: userData,
        productCount: proCount,
        category: categoryData,
      })
     
    }
    else {
      const UserData = await User.findOne({})
      res.render('allProducts',{
        Product: productData,
        productCount: proCount,
        category: categoryData,
        User : UserData
      })
   
    }
  } catch (error) {
    
  }
}
/////////////////////////END/////////////////////////////////


////////////// CATEGORY WISE FILTER///////////////////
const categoryFilter = async(req,res,next)=> {
  try {
    
    const id = req.params.id
    let page = 1;
    if (req.query.page) {
      page = req.query.page
    }

    const limit = 12
    const productData = await product.find({
      category:id,status:true
    }).populate('category')
    .limit(limit * 1)
    .skip((page - 1)* limit)
    .exec()

    const productCount = await product.find({}).countDocuments()

    let proCount = Math.ceil(productCount/limit)

    const categoryData = await category.find({status:true})

    if(req.session.user_id){
      const user = req.session.user_id
      const userData = await User.findOne({_id:user._id})
      res.render('categories', {
        Product: productData,
        user: userData,
        productCount: proCount,
        category: categoryData
    })
    }
    else{
      const UserData = await User.findOne({})
      res.render('categories',{
        Product: productData,
        productCount: proCount,
        category: categoryData,
        User : UserData
      })
    }


  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END/////////////////////////////////


////////////// ALL PRODUCTS PAGE SEARCH ///////////////////
const search = async(req,res,next)=> {
  try {
    
    const user = req.session.user_id
    const input = req.body.search
    const result = new RegExp(input, 'i')
    const categoryData = await category.find({status:true})
    const bannerData = await Banner.find({})

    let page = 1;
    if(req.query.page) {
      page = req.query.page
    }

    const limit = 12
    const productData = await product.find({
      name: result, status:true
    }).populate("category")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec()

    const productCount = await product.find({}).countDocuments()
    let proCount = Math.ceil(productCount / limit)

    if(req.session.user_id){
      const userData = await User.findOne({_id:user._id})

      res.render('allProducts',{
        user: userData,
        Product: productData,
        productCount: proCount,
        category: categoryData,
        banner: bannerData,
      })
    } 
    else {
      res.render('allProducts', {
        Product: productData,
        category: categoryData,
        productCount: proCount,
        banner: bannerData
    })
    }

  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END/////////////////////////////////


////////////// PRICE WISE FILTER///////////////////
const price = async(req,res,next)=> {
  try {
    
    const low = parseInt(req.query.low)
    const high = parseInt(req.query.high)
    const categoryData = await category.find({status: true})

    if(req.session.user_id) {
      const user = req.session.user_id
      const userData = await User.findOne({_id:user._id})

      if(typeof req.query.high === 'undefined') {
        const productData = await product.find({
          $and:[{price:{$gte:low}}],
          status: true
        })
        res.render('allProducts',{
          Product: productData,
          user: userData,
          category: categoryData
        })

      }
      else {
        const productData = await product.find({
          $and:[{price:{$gte:low}},{price:{$lt:high}}],
          status:true
        })
        res.render('allProducts',{
          Product: productData,
          user: userData,
          category: categoryData
        })
      }
    }
    else {
      if (typeof req.query.high === null) {
        const productData = await product.find({
          $and:[{price:{$gte:low}}],
          status:true
        })
        res.render('allProducts',{
          Product: productData,
          category: categoryData
        })
      }
      else {
        const productData = await product.find({
          $and:[{price:{$gte: low}},
          {price:{$lt:high}}],
          status:true
        })
        res.render('allProducts', {
          Product: productData,
          category: categoryData,
      })
      }
    }

  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END/////////////////////////////////


////////////// LOW PRICE WISE FILTER///////////////////
const priceLow = async(req,res,next)=> {
  try {
    
    const num = parseInt(req.query.value)

    const productData = await product.find({status:true}).sort({price:num})
    const categoryData  =await category.find({status:true})

    if(req.session.user_id){

      const user = req.session.user_id
      const userData = await User.findOne({_id:user._id})
      res.render('allProducts', {
        Product: productData,
        user: userData,
        category: categoryData
    })

  } 
  else {
    res.render('allProducts', {
      Product: productData,
      category: categoryData
  })
  }

  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END/////////////////////////////////


////////////// LOAD WISHLIST  ///////////////////
const loadWishlist = async(req,res,next)=> {
  try{

    const productData = await product.findOne({status:true}).populate('category')
    const categoryData = await category.find({})

    const user = req.session.user_id;
    const userData = await User.findOne({_id:user._id}).populate('wishlist.product')
    res.render('wishlist',{user:userData, category:categoryData, product: productData })

  } catch (error) {
    next(error.message);
  }
}
/////////////////////////END/////////////////////////////////


////////////// ADD WISHLIST  ///////////////////
const addWishlist = async(req,res,next)=> {
  try {
    
    if(req.session.user_id){

      const user = req.session.user_id;
      const proId = req.body.productId;
      const data = await User.findOne({_id:user._id, 'wishlist.product': proId})

      if(data){
        res.json({success: false})
      }
      else{
        const insert = await User.updateOne({_id:user._id},{$push:{wishlist:{product:proId}}})
        if(insert){
          res.json({success: true})
        }
      }

    }
    else{
      res.render('login',{message:'Please login to your account'})
    }

  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END/////////////////////////////////


////////////// DELETE WISHLIST  ///////////////////
const deleteWishlist = async(req,res,next)=>{
  try {
    
    const user = req.session.user_id;
    const proId = req.body.productId;
    const data = await User.updateOne({_id:user._id},{$pull:{wishlist:{product:proId}}})

    if(data){
      res.json({success:true})
    }

  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END/////////////////////////////////


////////////// ADD TO CART  ///////////////////
const addTocart = async(req,res,next)=> {
  try {
    
    const user = req.session.user_id;
    const proId = req.body.productId;
    const price = req.body.productPrice;

    const data = await User.findOne({_id:user._id, 'cart.product': proId})
    if(data){
      res.json({success:false})
    }
    else{

      const insert = await User.updateOne({_id:user._id},{$push:{cart:{product:proId,quantity:1,productTotalPrice:price}}})
      if(insert){

        const deleted = await User.updateOne({_id:user._id},{$pull:{wishlist:{product:proId}}})
        if(deleted){
          res.json({success:true})

          const cart = await User.findOne({_id:user._id})
          let sum = 0;
          for(let i=0; i< cart.cart.length; i++){
            sum = sum + cart.cart[i].productTotalPrice
          }
          await User.updateOne({_id:user._id},{$set:{cartTotalPrice: sum}})
          res.json({success: true, sum})
        }

      }

    }

  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END/////////////////////////////////


////////////// LOAD CART  ///////////////////
const loadCart = async(req,res,next)=> {
  try {
    
    const productData = await product.findOne({status:true}).populate('category');
    const categoryData = await category.find({})

    const user = req.session.user_id;
    const userData = await User.findOne({_id:user._id}).populate('cart.product');
    const userdata = await User.find({})

    res.render('cart',{ user : userdata , cartdata:userData, product:productData, category:categoryData});

  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END/////////////////////////////////


////////////// CART ADJUST QUANTITY  ///////////////////
const adjustQuantity = async(req,res,next)=> {
  try {
    
    const user = req.session.user_id;
    const proId = req.body.productId;
    const QuantityCount = req.body.QuantityCount;
    const proPrice = req.body.proPrice;

    const productData = await product.findOne({_id:proId,status:true})
    const stock = productData.stock;

    const adjustQuantity = await User.updateOne({_id:user._id,'cart.product':proId},{$inc:{'cart.$.quantity':QuantityCount}})
    const quantity = await User.findOne({_id:user._id,'cart.product':proId},{_id:0,'cart.quantity.$':1})
    const qty = quantity.cart[0].quantity;
    const prodSinglePrice = proPrice * qty

    await User.updateOne({_id:user._id,'cart.product':proId},{$set:{'cart.$.productTotalPrice': prodSinglePrice}})
    const cart = await User.findOne({_id:user._id})

    let sum = 0
    for(let i=0; i<cart.cart.length; i++) {
      sum = sum + cart.cart[i].productTotalPrice
    }

    const update = await User.updateOne({_id:user._id},{$set:{cartTotalPrice: sum}})
    res.json({success:true, prodSinglePrice,sum})

  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END/////////////////////////////////


////////////// DELETE CART  ///////////////////
const deleteCart = async(req,res,next)=>{
  try {
    
    const user = req.session.user_id;
    const proId = req.body.productId;

    const data = await User.updateOne({_id:user._id},{$pull:{cart:{product:proId}}})
    if(data){
      const cart = await User.findOne({_id:user._id})
      let sum = 0;
      for(let i=0; i<cart.cart.length; i++){
        sum = sum + cart.cart[i].productTotalPrice
      }

      await User.updateOne({_id:user._id},{$set:{cartTotalPrice:sum}})
      res.json({success:true})

    }
  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END/////////////////////////////////


////////////// LOAD USER PROFILE ///////////////////
const loadProfile = async(req,res,next)=> {
  try {
    
    const user = req.session.user_id;
    const userData = await User.findOne({_id:user._id})
    const productData = await product.find({status:true}).populate('category')
    const categoryData = await category.find({status:true})
    
    res.render('userProfile',{user:userData,category:categoryData,product:productData})


  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END/////////////////////////////////


////////////// USER VIEW ADDRESS ///////////////////
const viewAddress = async(req,res,next)=>{
  try {
    
    const user = req.session.user_id;
    const categoryData = await category.find({status:true})
    const userData = await User.findOne({_id:user._id})
    console.log(userData);
    res.render('viewAddress',{user:userData,category:categoryData})

  } catch (error) {
    next(error.message)
  }
}

////////////// LOAD USER ADD ADDRESS ///////////////////
const loadAddAddress = async(req,res,next)=> {
  try {
    
    const user = req.session.user_id;
    const categoryData = await category.find({status:true})
    const userData = await User.findOne({_id: user._id})

    res.render('addAddress',{user:userData,category:categoryData})

  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END/////////////////////////////////


////////////// USER ADD ADDRESS ///////////////////
const addAddress = async(req,res,next)=> {
  try {
    
    if(req.session.user_id){
      const user = req.session.user_id;

      if(req.body.Name.trim() == ''||req.body.Housename.trim() == ''
      ||req.body.Street.trim() == ''||req.body.District.trim() == ''
      ||req.body.State.trim() == ''||req.body.Pincode.trim() == ''
      ||req.body.Country.trim()==''||req.body.Phone.trim() == '') {

        const categoryData = await category.find({status:true})
        const userData = await User.findOne({_id:user._id})

        res.render('addAddress',{message:'All Fields are required!',user:userData,category:categoryData})
        
      }
      else{
        const data = await User.updateOne({_id:user._id},{
          $push:{
            address:{
              name: req.body.Name,
              housename:req.body.Housename,
              street:req.body.Street,
              district:req.body.District,
              state:req.body.State,
              pincode:req.body.Pincode,
              country:req.body.Country,
              phone:req.body.Phone
            }
          }
        })
        res.redirect('/viewAddress')
      }
    }
    else{
      res.redirect('/login')
    }

  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END/////////////////////////////////


////////////// UPDATE USER ADDRESS  ///////////////////
const updateAddress = async(req,res,next)=> {
  try {
    
    if(req.body.Name.trim() == ''||req.body.Housename.trim() == ''
    ||req.body.Street.trim() == ''||req.body.District.trim() == ''
    ||req.body.State.trim() == ''||req.body.Pincode == ''
    ||req.body.Country.trim()==''||req.body.Phone == '') {

      const categoryData = await category.find({status:true})
      const user = req.session.user_id;
      const userData = await User.findOne({_id:user._id})

      res.render('viewAddress',{ message:'Fields are empty', 
      user: userData, category: categoryData })
      
    }
    else {

      const user = req.session.user_id;
      const id = req.params.id;
      const data = await User.updateOne({_id:user._id, 'address._id': id},{
        $set: {
          'address.$':{
            name: req.body.Name,
            housename: req.body.Housename,
            street:req.body.Street,
            district:req.body.District,
            state:req.body.State,
            pincode:req.body.Pincode,
            country: req.body.Country,
            phone:req.body.Phone
          }
        }
      })

      console.log(data);

      res.redirect('/viewAddress')

    }

  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END/////////////////////////////////


////////////// REMOVE USER ADDRESS ///////////////////
const removeAddress = async(req,res,next)=> {
  try {
    
    const addId = req.body.addressId;
    const user = req.session.user_id;

    const data = await User.updateOne({_id:user._id},
      {$pull:{address:{_id:addId}}})

      if(data){
        res.json({success:true})
      }

  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END/////////////////////////////////


////////////// CHANGE USER PASSWORD ///////////////////
const changePassword = async(req,res,next)=> {
  try {
    
    const data = req.body
    const oldPass = data.oldPassword
    const userData = await User.findOne({_id:data.userId})

    if(userData){
      const compare = await bcrypt.compare(oldPass, userData.password)

      if(compare){
        if(data.newPassword == data.confirmPassword){
          const hash = await bcrypt.hash(data.newPassword, 10)
          const update = await User.updateOne({_id:data.userId},{$set:{password:hash}})

          res.json({success:true})
        }
        else{
          res,json({different:true})
        }
      }
      else{
        res.json({notmatch: true})
      }
    }

  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END/////////////////////////////////


////////////// MODAL ADD ADDRESS ///////////////////
const modalAdAddress = async(req,res,next)=> {
  try {
    
    const data = req.body;
    const oldPass = data.oldPassword
    const userData = await User.findOne({_id:data.userId})

    if(req.session.user_id){

      const user = req.session.user_id
      const update = await User.updateOne({_id:user._id},{
        $push:{
          address:{
            name:req.body.name,
            housename:req.body.Housename,
            street:req.body.Street,
            district:req.body.District,
            state:req.body.State,
            pincode:req.body.Pincode,
            country:req.body.Country,
            phone:req.body.Phone
          }
        }
      })

      res.json({success:true})

    }

  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END/////////////////////////////////


////////////// EDIT USER PROFILE ///////////////////
const editProfile = async(req,res,next)=> {
  try {
    
    if(req.body.Name.trim() == ''||
    req.body.email.trim() == ''){

      const categoryData = await category.find({status:true})
      const user = req.session.user_id;
      const userData = await User.findOne({_id:user._id})
      res.render('userProfile',{ message: 'Field are empty', 
      user:userData, category:categoryData})

    }
    else{
      if(req.session.user_id){

        const user = req.session.user_id;
        const data = await User.updateOne({_id:user._id},{$set:{
          name:req.body.Name,
          email:req.body.email
        }
      })

      res.redirect('/profile')

      }
      else{
        res.redirect('/login')
      }
    }

  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END/////////////////////////////////


////////////// LOAD CHECKOUT ///////////////////
const loadCheckout = async(req,res,next)=> {
  try {
    
    if(req.session.user_id) {

      const user = req.session.user_id;
      const userData = await User.findOne({_id:user._id}).populate('cart.product');
      const productData = await product.find({status:true}).populate('category');
      const categoryData = await category.find({});
      const couponData = await coupon.find({$nor:[{userUsed: user._id}]})

      if(userData.cart[0] == null){
        res.render('cart', { user: userData, category: categoryData, Product : productData, Coupon:coupon})
      }
      else{
        res.render('checkout',{user: userData, category: categoryData, Coupon:couponData})
      }
    } 
    else{
      res.redirect('/login')
    }

  } catch (error) {
    next(error.message)
  }
}
//////////////////////////////////////END/////////////////////////////////////////


////////////// LOAD ORDER ADDRESS ///////////////////
const loadOrderSuccess = async(req,res,next)=>{
  try {
    
    const user = req.session.user_id;

    const userData = await User.findOne({_id: user._id})
    const categoryData = await category.find({})

    const product = []

    const orderdata = req.body;

    if(!Array.isArray(orderdata.productId)){
      orderdata.productId = [orderdata.productId]
    }
    if(!Array.isArray(orderdata.quantity)){
      orderdata.quantity = [orderdata.quantity]
    }
    if(!Array.isArray(orderdata.singleTotal)){
      orderdata.singleTotal = [orderdata.singleTotal]
    }
    if(!Array.isArray(orderdata.singlePrice)){
      orderdata.singlePrice = [orderdata.singlePrice]
    }

    for(let i=0; i < orderdata.productId.length; i++){
      let productId = orderdata.productId[i]
      let quantity = orderdata.quantity[i]
      let singleTotal = orderdata.singleTotal[i]
      let singlePrice = orderdata.singlePrice[i]

      product.push({productId:productId, quantity:quantity, singleTotal:singleTotal, singlePrice:singlePrice})
    }

    if(req.body.paymentType == 'COD'){

      const status = req.body.paymentType == 'COD' ? 'confirmed' : 'pending'
      const total = req.body.total - req.body.discount1

      const newOrder = new order({
        userId: req.body.userId,
        deliveryAddress: req.body.address,
        product:product,
        total:total,
        paymentType:req.body.paymentType,
        orderId:`order_Id_${uuidv4()}`,
        status:status,
        discount: req.body.discount1,
        coupon: req.body.code,
        date:Date.now()
      })

      const productData = await newOrder.save()
      if(productData){

        const deleteCart = await User.updateOne({_id:user._id},{
          $pull:{cart:{product:{$in:orderdata.productId
          }}},$set:{cartTotalPrice: 0}
        })
        for (let i = 0; i < product.length; i++) {
          const productStock = await productModel.findById(product[i].productId)
          productStock.stock -= product[i].quantity
          await productStock.save()
      }

        const couponData = await coupon.updateOne({code: req.body.code},
          {$push:{userUsed: req.body.userId}})

        res.json({success:true})

      }
    } 
    else if (req.body.paymentType == 'ONLINE') {

      const total = req.body.total - req.body.discount1
      const orderData = new order({

        userId: req.body.userId,
        deliveryAddress: req.body.address,
        product: product,
        total: total,
        paymentType: req.body.paymentType,
        orderId: `order_Id_${uuidv4()}`,
        status:'Payment failed',
        discount: req.body.discount1,
        coupon: req.body.code,
        date: Date.now()
        
      })

      const productData = await orderData.save()
      if(productData) {

        const couponData = await coupon.updateOne({code:req.body.code},
          {$push: {userUsed: req.body.userId}})

          const latestOrder = await order.findOne({})
          .sort({date:-1})

          if(latestOrder) {
            let options = {
              amount : total * 100,
              currency: 'INR',
              receipt: "" + latestOrder._id
            };
            instance.orders.create(options, function(err, order){
              res.json({viewRazorpay: true, order})
            });
          }
      }
    } else if (req.body.paymentType == 'WALLET') {
      const data = await User.findOne({ _id: user._id })

      if (req.body.total > data.wallet) {

          res.json({ inSufficient: true })
      } else {

          const total = req.body.total - req.body.discount1
          const orderData = new order({
              userId: req.body.userId,
              deliveryAddress: req.body.address,
              product: product,
              total: total,
              paymentType: req.body.paymentType,
              orderId: `order_Id_${uuidv4()}`,
              status: "processing",
              discount: req.body.discount1,
              coupon: req.body.code,
              date: Date.now()


          })
          const productdata = await orderData.save()
          if (productdata) {

              const deleteCart = await User.updateOne({ _id: user._id }, {
                  $pull: { cart: { product: { $in: orderdata.productId } } },
                  $set: { cartTotalPrice: 0 }
              })
              for (let i=0; i<product.length; i++){
                const productStock = await productModel.findById(product[i].productId)
                productStock.stock -= product[i].quantity
                await productStock.save()
              }

              const couponData = await coupon.updateOne({ code: req.body.code },
                  { $push: { userUsed: req.body.userId } })

              const wallet = await User.updateOne({ _id: user._id }, { $inc: { wallet: -req.body.total } })
              res.json({ success: true })

          }
      }
  }

  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END/////////////////////////////////


////////////// PAYMENT VERIFY///////////////////
const verifPpayment = async(req,res,next)=> {
  try {
    
    const details = req.body
    let hmac = crypto.createHmac('sha256',process.env.YOUR_KEY_SECRET)
    console.log(hmac);
    hmac.update(
      details.payment.razorpay_order_id +
      "|" +
      details.payment.razorpay_payment_id
      
    );
    hmac = hmac.digest('hex');
    console.log("out");
    // 
    // if(hmac == details.payment.razorpay_signature) {
    //   console.log("in");
    //   const latestOrder = await order.findOne({})
    //   .sort({date:-1}).lean();
    //   const change = await order.updateOne({_id:latestOrder._id},
    //     {$set:{status:'confirmed'}})

    //     res.json({status:true})
    // }
    // else {

    //   res.json({failed:true})
    // }
    // 
    if (hmac == details.payment.razorpay_signature) {
      const latestOrder = await order.findOne({}).sort({ date: -1 }).lean();
      const change = await order.updateOne(
        { _id: latestOrder._id },
        { $set: { status: 'confirmed' } }
      );
      res.json({ status: true });
    } else {
      res.json({ failed: true });
    }

  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END/////////////////////////////////


////////////// ORDER SUCCESS ///////////////////
const orderSuccess = async(req,res,next)=> {
  try {
    
    const user = req.session.user_id;
    const userData = await User.findOne({_id:user._id})
    const categoryData = await category.find({})
    const couponData = await coupon.findOne({})
    const orderData = await order.findOne({userId:user._id})
    .sort({date:-1})
    .populate('product.productId')
    .lean()
    console.log("'okk11");
    if(orderData.paymentType == 'ONLINE') {
      for(let i=0 ; i<orderData.product.length; i++) {
        const deleteCart = await User.updateOne({_id:user._id},
          {$pull:{cart:{product:{$in:orderData.product[i].productId}}},
        $set:{cartTotalPrice: 0 }
      })
       console.log("ok2");
      
        const productStock = await productModel.findById(orderData.product[i].productId)
        productStock.stock -= orderData.product[i].quantity
        await productStock.save()
  
      console.log("ok33");
      }
    }
    console.log("OKKKKKKK");
    res.render('orderSuccess',{user:userData,category:categoryData,order:orderData})

  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END/////////////////////////////////


////////////// VIEW ORDERS ///////////////////
const viewOrders = async (req, res) => {
  try {
      const user = req.session.user_id
      const categoryData = await category.find({})
      const userData = await User.findOne({ _id: user._id })
      const orderData = await order.find({ userId: user._id })
          .sort({ date: -1 }).populate('product.productId')

      res.render('orderList', { user: userData, category: categoryData, order: orderData })


  } catch (error) {
      console.log(error.message);
  }
}
/////////////////////////END/////////////////////////////////


////////////// CANCEL ORDERS ///////////////////
const cancelOrder = async(req,res,next)=> {
  try {
    
    const user = req.session.user_id;
    const orderId = req.body.orderId;
    const status = 'cancelled';

    const cancel = await order.updateOne({_id:orderId},{$set:{status:status}})

    if(cancel) {
      const orderData = await order.findOne({_id:orderId})

      if(orderData.paymentType === 'ONLINE' || orderData.paymentType === 'WALLET') {
        const refund = await User.updateOne({_id:orderData.userId},
          {$inc:{wallet:orderData.total}})
      }
    }
    res.json({success:true})

  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END/////////////////////////////////


////////////// RETURN ORDERS ///////////////////
const returnOrder = async(req,res,next)=> {
  try {
    
    const id = req.body.orderId;
    const orderId = req.body.orderId;
    const status = 'Return requested'
    const Return = await order.updateOne({_id:id},
      {$set:{status:status}})

      if(Return){
      const orderData = await order.findOne({_id:orderId})
      if(orderData.paymentType === 'ONLINE' || orderData.paymentType === 'WALLET') {
        const refund = await User.updateOne({_id:orderData.userId},
          {$inc:{wallet:orderData.total}})
      }
      res.json({success:true})
      }
  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END/////////////////////////////////

// const submitReturn = async(req,res,next)=> {
//   try {
    
//     const id = req.body.orderId;
//     const status = 'Return requested'
//     const Return = await order.updateOne({_id:id},
//       {$set:{status:status}})

//       res.json({success:true})

//   } catch (error) {
//     next(error.message)
//   }
// }


////////////// LOAD ORDERS DETAILS ///////////////////
const orderDetails = async(req,res,next)=> {
  try {
    
    const id = req.params.id;
    const user =  req.session.user_id;
    const categoryData = await category.find({})
    const userData = await User.findOne({_id:user._id})
    const orderData = await order.findOne({_id:id})
    .populate('product.productId').populate('orderId')

    res.render('orderDetails',{category:categoryData,order:orderData,user:userData
    })

  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END/////////////////////////////////


////////////// APPLY COUPON ///////////////////
const applyCoupon = async(req,res,next)=> {
  try {
    
    const {total,code} = req.body
    const Code = code.toUpperCase()
    let user = req.session.user_id

    const data = await coupon.findOne({code:Code})
    const Codee = data.code

    if(data) {
      const used = await coupon.findOne({code:Code, userUsed:{$in:[user]}})
      if(used){
        res.json({used:true})
      } else {

        const today = Date.now()
        if(today <= data.expirydate){

          if(data.minPurchaseAmount <= total){
            let discountValue = total * data.percentage / 100

            if(discountValue <= data.maxDiscount) {
              let discount = discountValue
              let cost = total - discount
              res.json({available: true, discount,cost,Codee})
            }
            else {

              let discount = data.maxDiscount
              let cost = (total - data.maxDiscount)
              res.json({ available: true, discount, cost, Codee })
            }
          }
          else{
            res.json({ notAvailable: true })
          }
        } 
        else {
          res.json({ expired: true })
        }
      }
    } 
    else {
      res.json({ invalid: true })
    }

  } catch (error) {
    next(error.message)
  }
}
/////////////////////////////////////END/////////////////////////////////////////////

// const load404 = async(req,res)=>{

//   try{
//     res.render('404')
//   }catch(error){
//     console.log()
//   }
// }


const productFilter = async (req, res) => {
  try {
    let producte;
    let products = [];
    let Categorys;
    let Data = [];
    let Datas = [];

    // inside brands
    const { categorys, search, filterprice } = req.body;


    if (!search) {
      if (filterprice != 0) {
        if (filterprice.length == 2) {
          producte = await product.find({
           status:true,
            $and: [
              { price: { $lte: Number(filterprice[1]) } },
              { price: { $gte: Number(filterprice[0]) } },
            ],
          })
            .populate("category")
            
        } else {
          producte = await product.find({
           status:true,
            $and: [{ price: { $gte: Number(filterprice[0]) } }],
          })
            .populate("category")
            
        }
      } else {
        producte = await product.find({status:true })
          .populate("category")
          
      }
    } else {
      if (filterprice != 0) {
        if (filterprice.length == 2) {
          producte = await product.find({
           status:true,
            $and: [
              { price: { $lte: Number(filterprice[1]) } },
              { price: { $gte: Number(filterprice[0]) } },
              {
                $or: [
                  {
                    name: {
                      $regex: ".*" + search + ".*",
                      $options: "i",
                    },
                  },
                ],
              },
            ],
          })
            .populate("category")
            
        } else {
          producte = await product.find({
           status:true,
            $and: [
              { price: { $gte: Number(filterprice[0]) } },
              {
                $or: [
                  {
                    name: {
                      $regex: ".*" + search + ".*",
                      $options: "i",
                    },
                  },
                ],
              },
            ],
          })
            .populate("category")
            
        }
      } else {
        producte = await product.find({
         status:true,
          $or: [
            { name: { $regex: ".*" + search + ".*", $options: "i" } },
          ],
        })
          .populate("category")
          
      }
    }

    Categorys = categorys.filter((value) => {
      return value !== null;
    });

    if (Categorys[0]) {
      Categorys.forEach((element, i) => {
        products[i] = producte.filter((value) => {
          return value.category.name == element;
        });
      });

      products.forEach((value, i) => {
        Data[i] = value.filter((v) => {
          return v;
        });
      });

      // if (brands[0]) {
      //   brands.forEach((value, i) => {
      //     Data.forEach((element) => {
      //       Datas[i] = element.filter((product) => {
      //         return product.brand.brandName == value;
      //       });
      //     });
      //   });
      // }
      Datas.forEach((value, i) => {
        Data[i] = value;
      });
    } else {
      // if (brands[0]) {
      //   brands.forEach((value, i) => {
      //     Data[i] = product.filter((element) => {
      //       return element.brand.brandName == value;
      //     });
      //   });
      // } else {
        Data[0] = producte;
      // }
    }
    console.log(Data);
    res.json({ Data });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadSignup,
  loadLogin,
  insertUser,
  otpVerify,
  loadHome,
  userlogOut,
  verifyLogin,
  allProducts,
  categoryFilter,
  search,
  resetPassword,
  sendReset,
  verifyReset,
  price,
  priceLow,
  loadWishlist,
  addWishlist,
  deleteWishlist,
  loadCart,
  addTocart,
  adjustQuantity,
  deleteCart,
  loadProfile,
  viewAddress,
  loadAddAddress,
  addAddress,
  updateAddress,
  editProfile,
  removeAddress,
  changePassword,
  loadCheckout,
  loadOrderSuccess,
  verifPpayment,
  orderSuccess,
  modalAdAddress,
  cancelOrder,
  orderDetails,
  returnOrder,
  // submitReturn,
  viewOrders,
  applyCoupon,
  productFilter
  // load404
};

