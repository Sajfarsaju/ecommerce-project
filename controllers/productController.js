const product = require('../models/productModel');
const Category = require('../models/categoryModel');
const User = require('../models/userModel');
const categoryModel = require('../models/categoryModel');

const showProduct = async(req,res,next)=> {
  try {
    if(req.session.admin_id){
      const productId = await product.find().populate('category')
      console.log(productId);
      const categoryData = await Category.find()
      res.render('products',{ product:productId, category:categoryData })
    }
  } catch (error) {
    next(error.message)
  }
}

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

// const addProduct = async(req,res,next)=>{
//   try {
//     const newProductData = new product({
//       name:req.body.name,
//       image:req.body.image,
//       category:req.body.category,
//       description:req.body.description,
//       stock:req.body.stock,
//       price:req.body.price
//     })

//     const productSaved = await newProductData.save()
//     if(productSaved){
//       const productId = await product.find()
//       res.redirect('/admin/products')
//     }
//     else{
//       res.render('addProducts', { message: 'operation failed' })
//     }
//   } catch (error) {
//     next(error.message)
//   }
// }

const addProduct = async(req,res,next)=> {
  try {
    const imagearray = [];
        for(file of req.files){
            imagearray.push(file.filename)
        }
        const Product = new product({
            name:req.body.name,
            price:req.body.price,
            description:req.body.description,
            image:imagearray,
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

const editProduct = async(req,res,next)=> {
  try {
    if(req.session.admin_id){
      const id = req.query.id;
      console.log(id)
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
      // console.log(productData.image)
      
      }
      // console.log("hwhwdhd");
      
          
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

const deleteImage = async (req, res) => {
 try {
      const productId = req.query.productId;
      const index = req.query.index;
      // console.log(index+"ccccccccccccccccc"+productId);
      const deletedImage = await product.updateOne(
        { _id: productId },
        { $unset: { [`image.${index}`]: "" } }
      );
      const deletedImages = await product.updateOne(
        { _id: productId },
        { $pull: { image: null } }
      );
  
      // console.log(deletedImage);
      res.redirect("/admin/editProduct?id=" + productId);
    } catch (error) {
      console.log(error);
    }
  };


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


const productOfferManagement=async(req,res,next)=>{
  try {
      const offer=await product.find()
       
res.render('productManagement',{offer})
  } catch (error) {
    next(error.message)
  }
}

const productOfferEdit=async(req,res,next)=>{
  try {
      const offers=await product.findOne({_id:new ObjectId(req.params.id)})
     
      
      res.render('admin/editProductManage',{offers})
  } catch (error) {
    next(error.message)
  }
}

const productOfferEditPost=async(req,res,next)=>{
  try {
      
      const products = await product.findOne({_id:new ObjectId(req.params.id)})
      const price = products?.originalPrice ?? products.price
      const disPer = Math.round((parseFloat(req.body.discountPrice)/price) * 100)
      let originalPrice=products?.originalPrice
      if(!originalPrice){

          originalPrice= products.price
      }
      const disPrice=(originalPrice - parseFloat(req.body.discountPrice)).toFixed(2)
      await product.updateOne({_id:new ObjectId(req.params.id)},{$set:{price:disPrice,originalPrice:originalPrice,discountPrice:req.body.discountPrice,discount:disPer}}) 
      res.redirect('/admin/productOffer')
  } catch (error) {
    next(error.message)
  }
}

const productOfferDelete=async(req,res,next)=>{
  try {
      const id=req.query.id;
      const status=await product.findById({_id:id})
      if(status.offerStatus==true){
         const stat=await product.findByIdAndUpdate({_id:id},{$set:{offerStatus:false}})
         res.redirect('/admin/productOffer')
      }else{
          const stat=await product.findByIdAndUpdate({_id:id},{$set:{offerStatus:true}})
         res.redirect('/admin/productOffer')
  } }catch (error) {
    next(error.message)
  }
}



const categoryOfferManagement=async(req,res,next)=>{
 try {
    const offers=await Category.find()
       
     
    res.render('categoryOfferManage',{offers})
 } catch (error) {
  next(error.message)
 }
}


const catOfferEdit=async(req,res,next)=>{
  try {
    const offers=await Category.findOne({_id:new ObjectId(req.params.id)})
    console.log(offers)
        
     res.render('admin/catOfferEdit',{offers})
  } catch (error) {
    next(error.message)
  }
}

const catOfferEditPost = async(req,res,next)=>{
  try {
      const categories=await Category.findOne({_id:new ObjectId(req.params.id)})
      await category.updateOne({_id:new ObjectId(req.params.id)},{$set:{discount:req.body.discount}})
      const products=await product.find({category:req.body.category})
      products.forEach(async (data)=>{
          const productId=data._id
          const price=data.price - (data.price*req.body.discount/100)
          await product.updateOne({_id:productId},{$set:{price:price}})
      })
      res.redirect('/admin/categoryOffer')
  } catch (error) {
    next(error.message)
  }
}

const catOfferDelete=async(req,res,next)=>{
  try {
      const id=req.query.id;
      console.log(id)
      const status=await category.findById({_id:id})
      if(status.offerStatus==true){
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