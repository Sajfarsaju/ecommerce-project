const express = require('express');

const admin_route = express();

const session = require('express-session');

const multer = require('multer');

const path = require('path');

const multerConfig = require('../config/multer');

const upload = multerConfig.createMulter()

const adminController = require('../controllers/adminController');

const auth = require('../middleware/adminAuth');

const categoryController = require('../controllers/categoryController');

const productController = require('../controllers/productController');

const userController = require('../controllers/userController');

const { isLogin } = require('../middleware/auth');

const config = require('../config/config');


admin_route.set('views','./views/admin');

// admin_route.use(express.urlencoded({ extended:true }));
// admin_route.use(express.json());
// admin_route.use(session({
//   secret:config.sessionSecret,
//   saveUninitialized: true,
//   resave: false
// }));


///////////////////// LOGIN ROUTE /////////////////////
admin_route.get('/',auth.isLogout,adminController.loadLogin);
admin_route.post('/',auth.isLogout,adminController.verifyLogin);


//////////////////// LOAD HOME ROUTE //////////////////////////////////
admin_route.get('/dashboard',auth.isLogin,adminController.loadDashboard);


///////////////////// LOGOUT ROUTE //////////////////////////
admin_route.get('/logout',auth.isLogin,adminController.logOut);


///////////////////// CATOGERY ROUTES /////////////////////////////////
admin_route.get('/category',auth.isLogin,categoryController.showCategory);
admin_route.get('/addCategory',auth.isLogin,categoryController.createCategory);
admin_route.post('/addCategory',auth.isLogin,categoryController.addCategory);
// admin_route.get('/deleteCategory',auth.isLogin,categoryController.deleteCategory);
admin_route.get('/editCategory',auth.isLogin,categoryController.editCategory);
admin_route.post('/editCategory',auth.isLogin,categoryController.updateCategory);
admin_route.get('/categoryControl',auth.isLogin,categoryController.categoryControl);


///////////////////// PRODUCT ROUTES ///////////////////////////////////////////////
admin_route.get('/',upload.array('image',4),auth.isLogin,productController.showProduct);
admin_route.get('/products',auth.isLogin,productController.showProduct);
admin_route.get('/addProducts',upload.array('image',4) ,auth.isLogin,productController.newProduct);
admin_route.post('/addProducts',upload.array('image',4),auth.isLogin,productController.addProduct);
admin_route.get('/deleteProduct',auth.isLogin,productController.deleteProduct);
admin_route.get('/editProduct',auth.isLogin,productController.editProduct);
admin_route.post('/editProduct',upload.array('image',4),auth.isLogin,productController.updateProduct);
admin_route.get('/productControl',auth.isLogin,productController.productControl);
admin_route.get('/deletImage',auth.isLogin,productController.deleteImage);


//////////////////// BANNER MANAGEMENT ROUTES ////////////////////////////////////////
admin_route.get('/banner',upload.single('image'),auth.isLogin,categoryController.showBanner);
admin_route.get('/addBanner',upload.single('image'),auth.isLogin,categoryController.addBanner);
admin_route.post('/addBanner',upload.single('image'),auth.isLogin,categoryController.newBanner);
admin_route.get('/bannerEdit',upload.single('image'),auth.isLogin,categoryController.editBannerload);
admin_route.post('/bannerEdit',upload.single('image'),auth.isLogin,categoryController.updateProduct);


//////////////////// USER MANAGEMENT ROUTES /////////////////////
admin_route.get('/userPage',auth.isLogin,adminController.showUser);
admin_route.get('/useractive',auth.isLogin,adminController.userActive);


//////////////////// ORDER MANAGEMENT ROUTES /////////////////////
admin_route.get('/orders',auth.isLogin,adminController.loadOrders);
admin_route.get('/orderDetails/:id/:name',auth.isLogin,adminController.orderDetails);
admin_route.post('/updateStatus',auth.isLogin,adminController.updateStatus);


/////////////////// COUPON MANAGEMENT ROUTES /////////////////////////
admin_route.get('/loadCoupon',auth.isLogin,adminController.loadCoupon);
admin_route.get('/addCoupon',auth.isLogin,adminController.addCoupon);
admin_route.post('/addCoupon',auth.isLogin,adminController.newCoupon);
admin_route.get('/products/editCoupon/:id',auth.isLogin,adminController.loadEditCoupon);
admin_route.post('/products/editCoupon/:id',auth.isLogin,adminController.editCoupon);
admin_route.get('/deleteCoupon/:id',auth.isLogin,adminController.deleteCoupon);


//////////////////////// OFFER ROUTES /////////////////////////////
admin_route.get('/productOffer',productController.productOfferManagement);
admin_route.get('/editProOffer/:id',productController.productOfferEdit);
admin_route.post('/editProOffer/:id',productController.productOfferEditPost);
admin_route.get('/deleteProOffer',productController.productOfferDelete);

admin_route.get('/categoryOffer',productController.categoryOfferManagement);
admin_route.get('/editCatOffer/:id',productController.catOfferEdit);
admin_route.post('/editCatOffer/:id',productController.catOfferEditPost);
admin_route.get('/deleteCatOffer',productController.catOfferDelete);



/////////////////////// SALES ROUTES/////////////////////////////
admin_route.get('/sales',auth.isLogin,adminController.loadSales);
admin_route.post('/sales',auth.isLogin,adminController.salesReport );


admin_route.get('*',function(req,res){
  res.redirect('/admin')
});

module.exports = admin_route;

