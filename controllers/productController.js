const product = require('../models/productModel');

const Category = require('../models/categoryModel');

const User = require('../models/userModel');

const categoryModel = require('../models/categoryModel');

const sharp = require('sharp');

const fs = require('fs')

const path = require('path')

///////// ALL PRODUCTS ///////////////////
const showProduct = async(req,res,next)=> {
  try {
    if(req.session.admin_id){
      const productId = await product.find().populate('category')
      
      const categoryData = await Category.find()
      res.render('products',{ product:productId, category:categoryData })
    }
  } catch (error) {
    next(error.message)
  }
}
/////////////////////////////////////////


///////////// LOAD ADD PRODUCT /////////////
const newProduct = async(req,res,next)=> {
  try {
    if(req.session.admin_id){
      const categories = await Category.find()
      res.render('addProducts',{categories : categories})
    }
  } catch (error) {
    next(error.message)
  }
}
/////////////////////////////////////////


//////////// ADD NEW PRODUCT //////////////
const addProduct = async(req,res,next)=> {
  try {
    let imageId = [];

        const cropWidth = 1100;
        const cropHeight = 1467;

        for (let i = 0; i < req.files.length; i++) {
            const imagePath = path.join(__dirname, '../public/productImages', req.files[i].filename);
            const croppedImagePath = path.join(__dirname, '../public/productImages', 'cropped_' + req.files[i].filename);

            // Load the image using sharp
            const image = sharp(imagePath);

            // Convert the image to JPEG format with higher quality
            await image
                .jpeg({ quality: 90 })
                .resize(cropWidth, cropHeight, { fit: 'cover' })
                .toFile(croppedImagePath);

            // Add the cropped image to the imageId array
            imageId.push('cropped_' + req.files[i].filename);

            try {
                // Change the file permissions to allow deletion
                fs.chmodSync(imagePath, 0o777);

                // Delete the original WebP file
                fs.unlinkSync(imagePath);
            } catch (err) {
                console.log(err);
            }
        }
    // const imagearray = [];
    //     for(file of req.files){
    //         imagearray.push(file.filename)
    //     }
        const Product = new product({
            name:req.body.name,
            price:req.body.price,
            description:req.body.description,
            image:imageId,
            category:req.body.category,
            stock:req.body.stock,
        })
        const productData = await Product.save()
        if(productData){
            res.redirect('/admin/products')
        }else{
            res.render('addproduct',{message:"action failed"})
        }
  } catch (error) {
    console.log(error.message);
  }
}
/////////////////////////////////////////////////////////


///////////// DELETE PRODUCT /////////////////////////////
const deleteProduct = async(req,res,next)=> {
  try {
    if(req.session.admin_id){
      const id = req.query.id;
      const productId = await product.deleteOne({_id:id})
      res.redirect('/admin/products')
    }
  } catch (error) {
    console.log(error.message);
    next(error.message)
  }
}
/////////////////////////////////////////////////////


//////////////// EDIT PRODUCT ////////////////////
const editProduct = async(req,res,next)=> {
  try {
    if(req.session.admin_id){
      const id = req.query.id;
      
      const categories = await Category.find()
      const productId = await product.findOne({_id:id}).populate('category')
     
      const productdata = await product.findOne({_id:id});
      res.render('editProduct',{ productId , categories, productdata})
     
    }
  } catch (error) {
    console.log(error.message);
    next(error.message)
  }
}
//////////////////////////////////////////////////


//////////////// EDIT & UPDATE PRODUCT ///////////////////
const updateProduct = async(req,res)=>{
  const id = req.query.id
          const productData = await product.findOne({_id:id}).populate("category")
          const categoryData = await Category.find({})
  if (req.body.product == "" ||req.body.image == '' || req.body.category== "" || req.body.description == '' ||req.body.stock == '' || req.body.price == '') {
          res.render('editproduct',{productdata:productData,categorydata:categoryData,message:"All Fields Are Required"})
  }else{

  try {
      if(req.files){
        for(file of req.files){
          productData.image.push(file.filename)
      }
      
      
      }
      
      
          
          await product.updateOne({_id:id},{$set:{
              name:req.body.product,
              category:req.body.category,
              image:productData.image,
              description:req.body.description,
              stock:req.body.stock,
              price:req.body.price,
      }})
      
  
  res.redirect('/admin/products')
 
  } catch (error) {
      console.log(error.message);
  }
}
}
//////////////////////////////////////////////////


////////////// DELETE IMAGES ////////////////////////
const deleteImage = async (req, res) => {
 try {
      const productId = req.query.productId;
      const index = req.query.index;
      
      const deletedImage = await product.updateOne(
        { _id: productId },
        { $unset: { [`image.${index}`]: "" } }
      );
      const deletedImages = await product.updateOne(
        { _id: productId },
        { $pull: { image: null } }
      );
  
      
      res.redirect("/admin/editProduct?id=" + productId);
    } catch (error) {
      console.log(error);
    }
  };
////////////////////////////////////////////


///////// PRODUCT BLOCK & UNBLOCK /////////////////
const productControl = async (req, res) => {
  try {
      const id = req.query.id

      const productStatus = await product.findOne({ _id: id })

      if (productStatus.status) {

          await product.updateOne({ _id: id }, { $set: { status: false } })
          // req.session.user_id = null
      } else {
          await product.updateOne({ _id: id }, { $set: { status: true } })

      }
      res.redirect('/admin/products')

  } catch (error) {
      console.log(error.message);
  }
}
//////////////////////////////////////////////////


/////////////// PRODUCT DETAILS VIEW /////////////////////
const productDetails = async(req,res,next)=> {
    
    const user = req.session.user_id;
    const productId = req.query.id;
    const productInfo = await product.findOne({_id:productId}).populate('category')
    const categorydata = await Category.find({ status: true })
  try {
    if(req.session.user_id){

      const user = req.session.user_id
      const userData = await User.findOne({_id:user._id})

      res.render('singleProduct', {
        productDetails: productInfo,
        user: userData,
        category: categorydata,
    })
    }
    else {

      res.render('singleProduct',{ productDetails : productInfo,category: categorydata })
    }
    
  } catch (error) {
    next(error.message)
  }
}
/////////////////////////////////////////////////////////


/////////////// LOAD PRODUCT OFFERS //////////////////
const productOfferManagement=async(req,res,next)=>{
  try {
      const offer=await product.find()
       
res.render('productManagement',{offer})
  } catch (error) {
    next(error.message)
  }
}
//////////////////////////////////////////////////


///////////// LOAD EDIT PRODUCT OFFER ////////////
const productOfferEdit=async(req,res,next)=>{
  try {
      const offers = await product.findOne({_id:req.params.id})
     
      
      res.render('editProductManage',{offers})
  } catch (error) {
    next(error.message)
  }
}
/////////////////////////////////////////////

/////////////// PRODUCT OFFER EDIT AFTER UPDATE ////////
const productOfferEditPost=async(req,res,next)=>{
  try {
      
      const products = await product.findOne({_id:req.params.id})
      const price = products?.originalPrice ?? products.price
      console.log(req.body.prodiscount+"aaaaaaaaaaa");
      
      const disPer = Math.round((parseFloat(req.body.prodiscount)/price) * 100)
      console.log(req.body.prodiscount+"bbbbbbbbbbbbb");
      console.log(disPer+"ccccccccccccccccccc");
      let originalPrice=products?.originalPrice
      if(!originalPrice){

          originalPrice= products.price
          console.log(originalPrice+"ddddddddddd")
      }
      const disPrice=(originalPrice - parseFloat(req.body.prodiscount)).toFixed(2)
      console.log(disPrice+"eeeeeeeeeeee");
      await product.updateOne({_id:req.params.id},{$set:{proDiscPrice:disPrice,prodiscountPrice:req.body.discountPrice,discountPers:req.body.prodiscount}}) 
      res.redirect('/admin/productOffer')
  } catch (error) {
    next(error.message)
  }
}
///////////////////////////////////////////////////


//////////////// PRODUCT OFFE BLOCK & UNBLOCK ////////
const productOfferDelete=async(req,res,next)=>{
  try {
      const id=req.query.id;
      const status=await product.findById({_id:id})
      if(status.offerStatus===true){
         const stat=await product.findByIdAndUpdate({_id:id},{$set:{offerStatus:false}})
         res.redirect('/admin/productOffer')
      }else{
          const stat=await product.findByIdAndUpdate({_id:id},{$set:{offerStatus:true}})
         res.redirect('/admin/productOffer')
  } }catch (error) {
    next(error.message)
  }
}
///////////////////////////////////////////////////


////////////////// LOAD CATEGORY OFFER //////////////////
const categoryOfferManagement=async(req,res,next)=>{
 try {
    const offers=await Category.find()
       
     
    res.render('categoryOfferManage',{offers})
 } catch (error) {
  next(error.message)
 }
}
/////////////////////////////////////////////////////


/////////////// LOAD EDIT CATEGORY OFFER ////////////////
const catOfferEdit=async(req,res,next)=>{
  try {
    
    const offers=await Category.findOne({_id:req.params.id})
    
        
     res.render('catOfferEdit',{offers})
  } catch (error) {
    next(error.message)
  }
}
////////////////////////////////////////////////////



////////// UPDATE CATEGORY OFFER AFTER EDIT ////////////////////
const catOfferEditPost = async(req,res,next)=>{
  try {
   
      const categories=await Category.findOne({_id:req.params.id})
      
      await Category.updateOne({_id:req.params.id},{$set:{discount:req.body.discount}})
      const products=await product.find({category:req.params.id})
      
      
      products.forEach(async (data)=>{
          const productId=data._id
          
          const price=data.price - (data.price*(req.body.discount/100))
          
          await product.updateOne({_id:productId},{$set:{discountPrice:price}})
      })
      res.redirect('/admin/categoryOffer')
  } catch (error) {
    next(error.message)
  }
}
//////////////////////////////////////////////////////


///////////////// CATEGORY OFFER BLOCK & UNBLOCK
const catOfferDelete=async(req,res,next)=>{
  try {
      const id=req.query.id;
      
      const status=await Category.findById({_id:id})
      if(status.offerStatus===true){
          const stat=await Category.findByIdAndUpdate({_id:id},{$set:{offerStatus:false}})
          res.redirect('/admin/categoryOffer')
      }else{
          const stat=await Category.findByIdAndUpdate({_id:id},{$set:{offerStatus:true}})
          res.redirect('/admin/categoryOffer')        
      }
  } catch (error) {
    next(error.message)
  }
}
/////////////////////////////////////////////////////////////////


module.exports = {
  showProduct,
  newProduct,
  addProduct,
  deleteProduct,
  editProduct,
  deleteImage,
  updateProduct,
  productControl,
  productDetails,
  productOfferManagement,
  productOfferEdit,
  productOfferEditPost,
  productOfferDelete,
  categoryOfferManagement,
  catOfferEdit,
  catOfferEditPost,
  catOfferDelete

}