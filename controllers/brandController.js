const BrandModel=require('../models/Brand')
const ProductModel=require('../models/Product')
const CategoryModel=require('../models/Category')
const createBrandController=async(req,res)=>{
    try{
        const {brand_name}=req.body
        if(!brand_name)
        return res.send({message:'Brand name does not exist'})

        const brand=await BrandModel.findOne({brand_name})
        if(brand)
        return res.send({
            message:'Brand already exists',
            success:false
        })

        const newBrand=await new BrandModel({
            brand_name:brand_name
        }).save()

        res.send({
            message:`Brand ${brand_name} is created successfully`,
            success:true,
            newBrand
        })


    }catch(error)
    {
         res.send({
            message:'Something went wrong',
            success:false,
            error:error.message
         })
    }
}

const updateBrandController=async(req,res)=>{
    try{
        const {brand_name}=req.body
        const {brand_id}=req.params
        if(!brand_name)
        return res.send({message:'Brand name does not exist'})
        if(!brand_id)
        return res.send({message:'Brand id does not exist'})

        const brand=await BrandModel.findOne({brand_id})
        if(!brand)
        return res.send({
            message:'Brand name exist does not exist',
            success:false
        })

        const updatedBrand=await BrandModel.findByIdAndUpdate(brand._id,{
            brand_name:brand_name
        })

        res.send({
            message:`Brand ${brand_name} is updated successfully`,
            success:true,
            updatedBrand
        })


    }catch(error)
    {
         res.send({
            message:'Something went wrong',
            success:false,
            error:error.message
         })
    }
}

const deleteBrandController=async(req,res)=>{
      try{
        const {brand_id}=req.params
        if(!brand_id)
        return res.send({message:'Brand id does not exist'})

        const brand=await BrandModel.findOne({brand_id})
        if(!brand)
        return res.send({
            message:'Brand name does not exist',
            success:false
        })
         const products=await ProductModel.find({brand:brand._id})
        if(products.length!==0)
         {
            await ProductModel.deleteMany({brand:brand._id})
            await BrandModel.findByIdAndDelete(brand._id)
            return res.send({
            message:`All Products of the brand ${brand.brand_name} is deleted`,
            success:true,
        })
        }

        await BrandModel.findByIdAndDelete(brand._id)

        res.send({
            message:`Brand is deleted successfully`,
            success:true,
        })


    }catch(error)
    {
        console.log(error)
         res.send({
            message:'Something went wrong',
            success:false,
            error:error.message
         })
    }
}

const getAllBrandsController=async(req,res)=>{
      try{
           const brands=await BrandModel.find({}).sort('brand_name')
           if(brands.length===0)
           {
            return res.send({
                message:'There are no brands',
                success:true
            })
           }

           res.send({
            message:'All brands are fetched',
            success:true,
            brands
           })
      }catch(error)
      {
          res.send({
              message:'Something went wrong',
              success:false,
              error:error.message
          })
      }
}

const getAllBrandsCategoryController=async(req,res)=>{
    try{
           const {slug}=req.params
           if(!slug)
           return res.send({'message':'Enter the slug'})
           const cat=await CategoryModel.findOne({slug})
           const brandsListObject=await ProductModel.find({category:cat._id}).populate('brand').select('brand')
           const brandsList=brandsListObject.map((brandListObject)=>brandListObject.brand.brand_name)
           const uniqueBrands = [...new Set(brandsList)];
           const brands=await BrandModel.find({brand_name:{$in:uniqueBrands}})
           if(brands.length===0)
           {
            return res.send({
                message:'There are no brands',
                success:true
            })
           }

           res.send({
            message:'All brands are fetched',
            success:true,
            brands
           })
      }catch(error)
      {
          res.send({
              message:'Something went wrong',
              success:false,
              error:error.message
          })
      }
}

const getAllBrandsSubCategoryController=async(req,res)=>{
      try{
           const {slug,subcategory_id}=req.params
           if(!slug)
           return res.send({'message':'Enter the slug'})
           if(!subcategory_id)
           return res.send({'message':'Enter the subcategory id'})
           const number=parseInt(subcategory_id)
           const cat=await CategoryModel.findOne({slug})
           const subcategory=cat.subcategories.filter((subcat)=>subcat.subcategory_id===number)[0]
           const brandsListObject=await ProductModel.find({category:cat._id,subcategory:subcategory.subcategory_name}).populate('brand').select('brand')
           const brandsList=brandsListObject.map((brandListObject)=>brandListObject.brand.brand_name)
           const uniqueBrands = [...new Set(brandsList)];
           const brands=await BrandModel.find({brand_name:{$in:uniqueBrands}})
           if(brands.length===0)
           {
            return res.send({
                message:'There are no brands',
                success:true
            })
           }

           res.send({
            message:'All brands are fetched',
            success:true,
            brands
           })
      }catch(error)
      {
          res.send({
              message:'Something went wrong',
              success:false,
              error:error.message
          })
      }
}


module.exports={createBrandController,updateBrandController,
            deleteBrandController,getAllBrandsController,getAllBrandsCategoryController,
           getAllBrandsSubCategoryController}