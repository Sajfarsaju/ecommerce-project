const admin = require('../models/adminModel');
// Getting Category //
const category = require('../models/categoryModel');
// Getting Products //
const product = require('../models/productModel');
const Banner = require('../models/bannerModel');
const path = require('path');
const fs = require('fs');
const { log } = require('console');


/////////// LOAD CATEGORIES //////////////////
const showCategory = async(req,res,next)=> {
  try {
    const categories = await category.find({});
    if(req.session.admin_id){
      res.render('category',{ category : categories })
    }
    else
    {
      res.redirect('/admin')
    }
  } catch (error) {
    next(error.message)
  }
}
////////////////////////////////////////////



///////////// LAOD ADD NEW CATEGORY PAGE /////////////
const createCategory = async(req,res,next)=> {
  try {
    if(req.session.admin_id){
      res.render('addCategory')
    }
    else{
      res.redirect('/admin')
    }
  } catch (error) {
    next(error.message)
  }
}
////////////////////////////////////////////////


////////////// ADD NEW CATEGORY  ////////////////////
const addCategory = async (req, res, next) => {
  try {
      const catName = req.body.category
      const capitalize = (catName) => {
      const firstLetter = catName.charAt(0).toUpperCase();
      const remainingLetters = catName.slice(1).toLowerCase();
      return firstLetter + remainingLetters;  
    }
    
        const capitalizedStr = capitalize(catName); 

      const categories = await category.find({ name: capitalizedStr });
     
      if (categories.length > 0  ) {
        res.render('addCategory', { message: "Category Already Exist" });
      } else if (
        catName.trim().length === 0 || 
        catName.length<3 ||
        req.body.description.trim() == ''
      )
       {
        res.render('addCategory', { message: "Please enter a valid name" });
      } else {
        const newCategoryData = new category({
          name: capitalizedStr,
          description: req.body.description,
        });

        const categoryData = await newCategoryData.save();
        if (categoryData) {
          const categories = await category.find();
          res.render('category', { category: categories });
        } else {
          console.log('Operation Failed');
        }
    }
  } catch (error) {
    next(error.message);
  }
};
////////////////////////////////////////////////////////


/////////////// CATEGORY DELETE ////////////////////
const deleteCategory = async(req,res,next)=>{
  try {
    if(req.session.admin_id){
      const id = req.query.id
      const catogeries = await category.deleteOne({_id:id})
      res.redirect('/admin/category')
    }
  } catch (error) {
    console.log(error.message);
    next(error.message);
  }
}
//////////////////////////////////////////////


////////////// LOAD EDIT CATEGORY //////////////
const editCategory = async (req, res, next) => {
  try {
    if (req.session.admin_id) {
      const id = req.query.id;
      const categoryData = await category.findById({ _id: id });
      const errorMessage = req.session.errorMessage || '';
      req.session.errorMessage = ''; // Clear the error message
      res.render('editCategory', { catogeries : categoryData, errorMessage });
    }
  } catch (error) {
    next(error.message);
  }
};
////////////////////////////////////////////////


//////////// UPDATE CATEGORY AFTER EDIT ///////////////
const updateCategory = async (req, res, next) => {
  try {
    if (req.session.admin_id) {
      const catName = req.body.category;
      const capitalize = (catName) => {
        const firstLetter = catName.charAt(0).toUpperCase();
        const remainingLetters = catName.slice(1).toLowerCase();
        return firstLetter + remainingLetters;
      };

      const capitalizedStr = capitalize(catName);

      const existingCategory = await category.findOne({ name: capitalizedStr });
      if (existingCategory) {
        req.session.errorMessage = 'Category already exists.';
        return res.redirect('/admin/editcategory?id=' + req.body.id);


      }

      if (
        catName.trim().length === 0 ||
        catName.length < 3 ||
        req.body.description.trim() === ''
      ) {
        req.session.errorMessage = 'Invalid category details.';
        return res.redirect('/admin/editcategory?id=' + req.body.id);
         
      } else {
        const updatedCategory = await category.findOneAndUpdate(
          { _id: req.body.id },
          { $set: { name: capitalizedStr, description: req.body.description } }
        );

        if (updatedCategory) {
          const categories = await category.find();
          res.redirect('/admin/category');
        } else {
          console.log('Operation Failed');
        }
      }
    } else {
      res.redirect('/admin/login');
    }
  } catch (error) {
    next(error.message);
  }
};
/////////////////////////////////////////////////////////


////////////// CATEGORY BLOCK & UNBLOCK ///////////////////
const categoryControl = async(req,res,next)=>{
  try {
    const id = req.query.id;

    const categoryStatus = await category.findOne({_id:id})
    
    if(categoryStatus.status){

      await category.updateOne({_id:id},{$set:{status:false}})
      
    }
    else{
      await category.updateOne({_id:id},{$set:{status:true}})
    }
    res.redirect('/admin/category')
  } catch (error) {
    next(error.message)
  }
}
///////////////////////////////////////////////


/////////////// LOAD BANNER ////////////////
const showBanner = async(req,res,next)=>  {
  try {
    const bannerInfo = await Banner.find({})
    if(req.session.admin_id){
      res.render('banner',{ banner: bannerInfo })
    }
  } catch (error) {
    next(error.message)
  }
}
/////////////////////////////////////////


/////////////// LOAD ADD NEW BANNER ///////////
const addBanner = async(req,res,next)=> {
  try {
    if(req.session.admin_id){
      res.render('addBanner')
    }
    else{
      res.redirect('/banner')
    }
  } catch (error) {
    next(error.message)
  }
}
////////////////////////////////////////////


///////////// UPDATE AFTER ADD NEW BANNER ////////
const newBanner = async(req,res,next)=> {
  try {
    const addBannerData = new Banner({
      name: req.body.name,
      description: req.body.description,
      image: req.file.filename,
    });
    const bannerData = await addBannerData.save()
    if(bannerData){
      const banners = await Banner.find()
      res.render('banner',{ banner:banners })
    }
    else{
      console.log('Operation Failed');
    }
  } catch (error) {
    next(error.message)
  }
}
/////////////////////////////////////////////


//////////// LOAD BANNER EDIT ////////////////
const editBannerload = async (req,res,next)=>{

  try {
    const banner = await Banner.find()
    const id = req.query.id
    res.render('editBanner',{_id:id,banner})
  } catch (error) {
    next(error.message)
  }
}
//////////////////////////////////////////////


/////// UPDATE AFTER EDIT BANNER /////////////
const updateProduct = async(req,res)=>{
  const id = req.query.id
          const bannerData = await Banner.findOne({_id:id})
  if (req.body.product == "" ||req.body.image == '' || req.body.description == '' ) {
          res.render('editBanner',{banner:bannerData,message:"All Fields Are Required"})
  }else{

  try {
      if(req.files){
        for(file of req.files){
          bannerData.image.push(file.filename)
      }
     
      
      }
      
      
          
          await Banner.updateOne({_id:id},{$set:{
              name:req.body.name,
              image:bannerData.image,
              description:req.body.description,
      }})
      
  
  res.redirect('/admin/banner')
 
  } catch (error) {
      console.log(error.message);
  }
}
}
///////////////////////////////////////////////////


module.exports = {
  showCategory,
  createCategory,
  addCategory,
  deleteCategory,
  editCategory,
  updateCategory,
  categoryControl,
  showBanner,
  addBanner,
  newBanner,
  editBannerload,
  updateProduct
}