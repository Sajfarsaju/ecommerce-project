const bcrypt = require('bcrypt');
const randomstring = require('randomstring');
const Admin = require('../models/adminModel');
const order = require('../models/orderModel');
const coupon = require('../models/couponModel');
const User = require('../models/userModel');
const category = require('../models/categoryModel')
require('dotenv').config()

////////////// LOAD LOGIN ///////////////////
const loadLogin = async(req,res)=> {

  try {
    
    res.render('adminLogin');

  } catch (error) {
    console.log(error.message);
  }

}
/////////////////////////END////////////////////


////////////// LOAD DASHBOARD ///////////////////
const loadDashboard = async(req,res,next)=>{
  try {

    const sales = await order.find({status:'Delivered'}).count()
    const customers = await User.find({}).count()
    const online = await order.find({paymentType: 'ONLINE'}).count()
    const cod = await order.find({paymentType:'COD'}).count()
    const wallet = await order.find({paymentType:'WALLET'}).count()
    
    const categorydata = await category.find({})

    const ord = await order.find().populate({
      path: 'product.productId',
            populate: {
                path: 'category',
                model: category
            }
    })
    

    const categoryCount = {};

    ord.forEach(order => {
      order.product.forEach(product => {
        const category = product.productId.category.name;
        if(category in categoryCount) {
          categoryCount[category] += 1;
        }
        else{
          categoryCount[category] = 1;
        }
        // console.log(order.product)
      });
    });

    const sortedCategoryCount = Object.entries(categoryCount).sort((a,b) => b[1] - a[1]);

    const numbersOnly = sortedCategoryCount.map(innerArray => innerArray[1]);

    const categoryNames = sortedCategoryCount.map((categoryCount) => {
      return categoryCount[0];
    });


    const revenueOfTheWeekly = await order.aggregate([
      {
          $match: {
              date: {
                  $gte: new Date(new Date().setDate(new Date().getDate() - 7))
              }, status: {
                  $eq: "Delivered"
              }
          }
      },
      {
          $group: {
              _id: null,
              Revenue: { $sum: "$total" }
          }
      }
  ])
  const weeklyRevenue = revenueOfTheWeekly.map((item) => {
      return item.Revenue;
  })




  const weeklySales = await order.aggregate([
  {
    $match: {
      date: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 7))
      },
      status: {
        $eq: "Delivered"
      }
    }
  },
  {
    $group: {
      _id: {
        $dateToString: {
          format: "%d-%m-%Y",
          date: "$date"
        }
      },
      sales: {
        $sum: "$total"
      }
    }
  },
  {
    $sort: {
      _id: 1
    }
  }
]);

  // console.log(weeklySales);
  const date = weeklySales.map((item) => {
      return item._id;
  });
  const saless = weeklySales.map((item) => {
      return item.sales;
  });


    res.render('dashboard', {
      salesCount: sales,
      userCount: customers,
      revenueOfTheWeek: weeklyRevenue,
      upi: online, cash: cod, wallet:wallet,
      wsales: weeklySales,
      date: date,
      sales: saless,
      categoryName: categoryNames,
      catogorySaleCount:numbersOnly
  });
 
    
  } catch (error) {
    console.log(error.message);
    next(error.message)
  }
}
/////////////////////////END////////////////////


////////////// VERIFY LOGIN ///////////////////
const verifyLogin = async(req,res)=>{
  try {
    
    const admEmail = process.env.ADMIN_EMAIL
    const admPass = process.env.ADMIN_PASS

    const email =
     req.body.email;
    const password = req.body.password;

    if(admEmail == email && admPass == password) {
      req.session.admin_id = admEmail;
      res.redirect('/admin/dashboard');
    }
    else{
      res.render('adminLogin', {message:"email and password is incorrect!"})
    }

  } catch (error) {
    console.log(error.message);
    next(error.message)
  }
}
/////////////////////////END/////////////////////////////


////////////// SHOW USER ///////////////////
const showUser = async(req,res,next)=> {
  try {
    if(req.session.admin_id){
      const userInfo = await User.find({})
      res.render('user', { user: userInfo })
    }
    else{
      console.log('Not Working');
    }
  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END////////////////////


////////////// USER ACTIVE ///////////////////
const userActive = async (req, res) => {
  try {
      const id = req.query.id

      const userstatus = await User.findOne({ _id: id })
      if (userstatus.status) {

          await User.updateOne({ _id: id }, { $set: { status: false } })
          req.session.user_id = null
      } else {
          await User.updateOne({ _id: id }, { $set: { status: true } })

      }
      res.redirect('/admin/userPage')

  } catch (error) {
      console.log(error.message);
  }
}
/////////////////////////END///////////////////////


////////////// LOAD ORDERS ///////////////////
const loadOrders = async(req,res,next)=> {
  try {
    
    const orderData = await order.find({}).sort({date:-1})
    .populate('product.productId').populate('userId')

    res.render('orders',{order:orderData})

  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END////////////////////


////////////// UPDATE ORDER STATUS ///////////////////
const updateStatus = async(req,res,next)=> {
  try {
    
    const ordId = req.body.orderId;
    const status = req.body.newStatus;

    const update = await order.updateOne({_id:ordId},{$set:{status:status}})

    res.json(update)
  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END//////////////////////////


////////////// ORDER VIEW ///////////////////
const orderDetails = async(req,res,next)=> {
  try {
    const id = req.params.id;

    const orderData = await order.findOne({_id:id}).populate('product.productId')
    .populate('userId')

    res.render('orderDetails', {order:orderData})
  } catch (error) {
    next(error.message)
  }
}

////////////// LOAD COUPON MANAGEMENT ///////////////////
const loadCoupon = async(req,res,next)=> {
  try {
    
    const couponData = await coupon.find({})
    res.render('coupon', {coupon:couponData})

  } catch (error) {
    console.log(error.message);
  }
}
/////////////////////////END/////////////////////////////

////////////// LOAD ADD COUPON ///////////////////
const addCoupon = async(req,res,next)=>{
  try {
    
    res.render('addCoupon')

  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END/////////////////////


////////////// NEW COUPON ///////////////////
const newCoupon = async(req,res,next)=> {
  try {
    
    let code = req.body.code

    code = code.trim()
    couponCode = code.toUpperCase()
      const discount = req.body.maxDiscount
      const expiry = new Date(req.body.expiryDate)
      const minAmount = req.body.minAmount
      const percentage = req.body.percentage

      const data = await coupon.findOne({code:couponCode})
      if(data) {
        res.render('addCoupon',{message:'coupon is already exist!!'})
      } else if (couponCode == '' || percentage.trim() == '') {
        res.render('addCoupon',{message:'fields are empty'})
      } else if (percentage > 100 || percentage < 0) {
        res.render('addCoupon',{message:'percentage should be between 0 to 10 !'})
      } else if (expiry.getTime() <= Date.now()) {
        res.render('addCoupon',{message:'Date should be valid'})
      }

      else{
        const couponData = new coupon({
          code: couponCode,
          maxDiscount: discount,
          expirydate: expiry,
          minPurchaseAmount: minAmount,
          percentage: percentage
        });

        const data = await couponData.save()
        if(data){
          res.redirect('/admin/loadCoupon')
        }
      }

  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END/////////////////////////////////


////////////// LOAD EDIT COUPON ///////////////////
const loadEditCoupon = async(req,res,next)=> {
  try {
    
    const id = req.params.id

    const couponData = await coupon.findOne({_id:id})
    res.render('editCoupon',{coupon:couponData})

  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END//////////////////////////


////////////// EDIT COUPON ///////////////////
const editCoupon = async(req,res,next)=> {
  try {

    let code = req.body.code
    code = code.trim()
    couponCode = code.toUpperCase()
    const discount = req.body.maxDiscount
    const expiry = new Date(req.body.expiryDate)
    const minAmount = req.body.minAmount
    const percentage = req.body.percentage

    const id = req.params.id;

    const couponData = await coupon.findOne({_id:id})

    if(couponData){
      if (couponCode == '' || percentage.trim() == '') {
        res.render('editCoupon', { coupon: couponData, message: 'fields are empty!!' })
    } else if (percentage > 10 || percentage < 0) {
      res.render('editCoupon', { coupon: couponData, message: 'percentage should be between 0 to 10!!!' })

  } else if (expiry.getTime() <= Date.now()) {
      res.render('editCoupon', { coupon: couponData, message: 'Date should be valid' })
  }
  else {
    const update = await coupon.updateOne({_id:id},
      {
        $set:{
          code:couponCode,
          maxDiscount:discount,
          expirydate:expiry,
          minPurchaseAmount:minAmount,
          percentage:percentage
        }
      })

      res.redirect('/admin/loadCoupon')
  }

}

  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END/////////////////////////////////


////////////// DELETE COUPON ///////////////////
const deleteCoupon = async(req,res,next)=> {
  try {
    
    const id = req.params.id
    await coupon.deleteOne({_id:id})

    res.redirect('/admin/loadCoupon')

  } catch (error) {
    next(error.message)
  }
}
/////////////////////////END//////////////////////


////////////// LOGOUT ///////////////////
const logOut = async(req,res,next)=>{
  try {
    const session = req.session.admin_id = null;
    if(!session){
    res.redirect('/admin');
    }
  } catch (error) {
    console.log(error.message);
  }
}
/////////////////////////END////////////////////////


////////////// LOAD SALES ///////////////////
const loadSales = async(req,res,next)=>{

  try {

    res.render('sales');
  } catch (error) {
    next(error.message);
  }
}
/////////////////////////END//////////////////


////////////// SALES REPORT ///////////////////
const salesReport = async(req,res,next)=>{

  try{
    const currentDate = new Date(req.body.to)
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1)

    if (req.body.from.trim() == '' || req.body.to.trim() == '') {
        res.render('sales', { message: 'All feilds are required' })
    } 
    else {
        const salesdata = await order.find({
            status: 'Delivered',
            date:
                { $gte: new Date(req.body.from), $lte: new Date(newDate) }
        }).populate
            ('product.productId')

        // console.log(salesdata);

        res.render('salesReport', { sales: salesdata })
    }

  }catch(error){
    next(error.message)
  }
}
/////////////////////////END//////////////////////////

module.exports = {
  loadLogin,
  loadDashboard,
  verifyLogin,
  showUser,
  userActive,
  loadOrders,
  updateStatus,
  orderDetails,
  loadCoupon,
  addCoupon,
  newCoupon,
  loadEditCoupon,
  editCoupon,
  deleteCoupon,
  logOut,
  loadSales,
  salesReport
  
}

