const admin = require('../models/adminModel');
// Getting Category //
const category = require('../models/categoryModel');
// Getting Products //
const product = require('../models/productModel');
const Banner = require('../models/bannerModel');
const path = require('path');
const fs = require('fs');
const { log } = require('console');

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


// 
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
      console.log(categories);
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

// const editCategory = async(req,res,next)=> {
//   try {
//     if(req.session.admin_id){
//       const id = req.query.id;
//       const catogeries = await category.findById({_id:id})
//       res.render('editCategory', { catogeries })
//     }
//   } catch (error) {
//     next(error.message)
//   }
// }
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


// const updateCategory = async (req, res, next) => {
//   try {
//     if (req.session.admin_id) {
//       const catName = req.body.category;
//       const capitalize = (catName) => {
//         const firstLetter = catName.charAt(0).toUpperCase();
//         const remainingLetters = catName.slice(1).toLowerCase();
//         return firstLetter + remainingLetters;
//       };

//       const capitalizedStr = capitalize(catName);

//       const categories = await category.find({ name: capitalizedStr });
//       console.log(categories);
//       if (categories.length > 0) {
//         res.redirect('/admin/category',{message:"Category already exists!"});
//       } else if (
//         catName.trim().length === 0 ||
//         catName.length < 3 ||
//         req.body.description.trim() === ''
//       ) {
//         res.redirect('/admin/category',{message:"Category already exists"});

//       } else {
//         const updatedCategory = await category.findOneAndUpdate(
//           { _id: req.body.id },
//           { $set: { name: capitalizedStr, description: req.body.description } }
//         );

//         if (updatedCategory) {
//           const category = await category.find();
//           res.redirect('/admin/category', { category: category });
//         } else {
//           console.log('Operation Failed');
//         }
//       }
//     } else {
//       res.redirect('/admin/login'); // Redirect to login page or handle unauthorized access
//     }
//   } catch (error) {
//     next(error.message);
//   }
// };


// const updateCategory = async(req,res,next)=> {
//   try {
    


//     if(req.session.admin_id){
//       const updatedCategory = await category.findOneAndUpdate({_id:req.body.id},{$set:{name:req.body.category,description:req.body.description}})
//     }
//     res.redirect('/admin/category')
//   } catch (error) {
//     next(error.message)
//   }
// }

// const updateCategory = async(req,res,next)=>{
//   try {
//     if(req.session.admin_id){
//       if(req.files){
//         const updateCategory = await category.findByIdAndUpdate({_id:req.body.id},{$set:{image:req.body.image}});

//       }
//       else{
//         const updateCategory = await category.findOneAndUpdate({_id:req.body.id},{$set:{name:req.body.category}});
//         console.log(req.body.id);
//       }
//       res.redirect('/admin/category')
//     }
//   } catch (error) {
//     console.log(error.message);
//     next(error.message);
//   }
// } 

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

const editBannerload = async (req,res,next)=>{

  try {
    const banner = await Banner.find()
    const id = req.query.id
    res.render('editBanner',{_id:id,banner})
  } catch (error) {
    next(error.message)
  }
}

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
      console.log(bannerData.image)
      
      }
      console.log("hwhwdhd");
      
          
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