const express = require('express');

const mongoose = require('mongoose');

const user_route = express()

const session = require('express-session');

const auth = require('../middleware/auth');

// user_route.set('view engine','ejs');
user_route.set('views','./views/user');

const userController =require("../controllers/userController");

const productController = require('../controllers/productController');

const { isLogin } = require('../middleware/adminAuth');

const config = require('../config/config');

// user_route.use(session({
//   secret:config.sessionSecret,
//   saveUninitialized: true,
//   resave: false
// }));

// user_route.use(express.json());
// user_route.use(express.urlencoded({extended:true}));

/////////////////// USER LOGIN ROUTES ////////////////////////
user_route.get('/login',auth.isLogout,userController.loadLogin);
user_route.post('/login',auth.isLogout,userController.verifyLogin);
user_route.get('/',userController.loadHome);
user_route.get('/Logout',auth.isLogin,userController.userlogOut);


/////////////////// USER SIGNUP ROUTES /////////////////////////
user_route.get('/signup',auth.isLogout,userController.loadSignup);
user_route.post('/signup',auth.isLogout,userController.insertUser);
user_route.post('/resendOTP',auth.isLogout,userController.resendOTP);
user_route.post('/otpVerify',auth.isLogout,userController.otpVerify);


/////////////////// RESET PASSWORD ROUTES ///////////////////////////////
user_route.get('/resetPassword',auth.isLogin,userController.resetPassword);
user_route.post('/resetPassword',auth.isLogin,userController.sendReset);
user_route.post("/verifyReset",auth.isLogin,userController.verifyReset);


/////////////////// PRODUCT ROUTES ////////////////////////////////////////
user_route.get('/singleProduct',productController.productDetails);
user_route.get('/allProducts',userController.allProducts);


/////////////////// WISHLIST ROUTES //////////////////////////////
user_route.get('/wishlist',auth.isLogin,userController.loadWishlist);
user_route.post('/addToWishlist',auth.isLogin,userController.addWishlist);
user_route.post('/deleteWishlist',auth.isLogin,userController.deleteWishlist);


/////////////////// CART ROUTES /////////////////////////////
user_route.get('/cart',auth.isLogin,userController.loadCart);
user_route.post('/addTocart',auth.isLogin,userController.addTocart);
user_route.post('/adjustQuantity',auth.isLogin,userController.adjustQuantity);
user_route.post('/deleteCart',auth.isLogin,userController.deleteCart);
user_route.post('/applycoupon',auth.isLogin,userController.applyCoupon);


/////////////////// PROFILE ROUTES ////////////////////////////////
user_route.get('/profile',auth.isLogin,userController.loadProfile);
user_route.get("/viewAddress",auth.isLogin,userController.viewAddress);
user_route.get('/addAddress',auth.isLogin,userController.loadAddAddress);
user_route.post('/addAddress',auth.isLogin,userController.addAddress);
user_route.post('/removeAddress',auth.isLogin,userController.removeAddress);
user_route.post('/viewAddress/:id',auth.isLogin,userController.updateAddress);
user_route.post('/editProfile/:id',auth.isLogin,userController.editProfile);
user_route.post('/modaldAdAddress',auth.isLogin,userController.modalAdAddress);
user_route.post('/changePassword',auth.isLogin,userController.changePassword);


/////////////////// CHECKOUT ROUTES ///////////////////////////////////
user_route.get('/loadCheckout',auth.isLogin,userController.loadCheckout);
user_route.post('/placeOreder',auth.isLogin,userController.loadOrderSuccess);
user_route.get('/ordersuccess',auth.isLogin,userController.orderSuccess);
user_route.post('/verifPpayment',auth.isLogin,userController.verifPpayment);


/////////////////// ORDER ROUTES ///////////////////////////////////
user_route.get('/vieworders',auth.isLogin,userController.viewOrders);
user_route.get('/orderDetails/:id',auth.isLogin,userController.orderDetails);
user_route.post('/cancellOrder',auth.isLogin,userController.cancelOrder);
user_route.post('/returnOrder',auth.isLogin,userController.returnOrder);
// user_route.post('/submit-return',userController.submitReturn);

user_route.get('/returnSubmit',auth.isLogin,userController.returnFormLoad);
user_route.post('/returnSubmit',auth.isLogin,userController.returnFormPost);

/////////////////// PRICE FILTER ROUTES /////////////////////
user_route.get('/price',auth.isLogout,userController.price);
user_route.get('/priceLow',auth.isLogout,userController.priceLow);
user_route.get('/category/:id',userController.categoryFilter);


/////////////////// SEARCH ROUTES //////////////////////////////
user_route.get('/search',auth.isLogout,userController.allProducts);
user_route.post('/search',auth.isLogout,userController.search);
user_route.post('/shopFilter',auth.isLogout,userController.productFilter)

// user_route.get('/404',userController.load404)

module.exports = user_route;