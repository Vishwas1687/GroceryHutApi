const slugify=require('slugify')
const fs=require('fs')
const CategoryModel=require('../models/Category')
const ProductModel=require('../models/Product')
const createCategoryController=async(req,res)=>{
    try{
    const {category_id,category_name,subcategories}=req.body
    // const {photo}=req.files
    if(!category_id)
    return res.send({message:'Category id is not entered'})
    if(!category_name)
    return res.send({message:'Category name is not entered'})
    if(!subcategories)
    return res.send({message:'Enter the list of subcategories for the category'})
    // if(!photo)
    // return res.send({message:'Sub category photo should be entered'})

    const existingCategory=await CategoryModel.findOne({category_id})
    const existingCategoryName=await CategoryModel.findOne({category_name})
    if(existingCategory || existingCategoryName)
    {
        return res.send({
            message:'Category already exists',
            success:false
        })
    }
      
      for (const subcategory of subcategories) {
      if (!subcategory.subcategory_id) {
        return res.send({ message: 'Subcategory id is not entered' });
      }
      if (!subcategory.subcategory_name) {
        return res.send({ message: 'Subcategory name is not entered' });
      }
    } 
    
    const newCategory=await new CategoryModel({
        category_id:category_id,
        slug:slugify(category_name),
        category_name:category_name,
        subcategories:subcategories,
    })
     
    // newCategory.photo.data=fs.readFileSync(photo.path)
    // newCategory.photo.contentType=photo.type



    await newCategory.save()

    res.send({
        message:`Category ${newCategory.category_name} successfully added`,
        success:true,
        category:newCategory
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

const updateCategoryController=async(req,res)=>{
    try{
    const {category_name,subcategories}=req.body
    const {slug}=req.params
    if(!category_name)
    return res.send({message:'Category name is not entered'})
    if(!subcategories)
    return res.send({message:'Enter the list of subcategories for the category'})

    const existingCategory=await CategoryModel.findOne({slug:slug})
    
    const CategoriesName=await CategoryModel.findOne({category_name})
    if(CategoriesName && existingCategory.category_name!==CategoriesName.category_name)
    return res.send({
        message:'Category name already exists',
        success:false,
    })
    
    const updatedCategory=await CategoryModel.findByIdAndUpdate(existingCategory._id,{
          category_id:existingCategory.category_id,
          category_name:category_name,
          slug:slugify(category_name),
          subcategories:subcategories
    })

    res.send({
        message:`Category ${updatedCategory.category_name} successfully updated`,
        success:true,
        category:updatedCategory
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

const deleteCategoryController=async(req,res)=>{
    try{
    const {slug}=req.params
    const category=await CategoryModel.findOne({slug})
    if(!category)
    {
        return res.send({
            message:'Not a valid category',
            success:false})
    }

    const products=await ProductModel.find({category:category._id})
    if(products)
    {
        await ProductModel.deleteMany({category:category._id})
        await CategoryModel.findByIdAndDelete(category._id)
        return res.send({
        message:`Category ${slug} is successfully deleted and products of this category is also deleted`,
        success:true,
        category:category.category_name
    })
    }
    
   await CategoryModel.findByIdAndDelete(category._id)
    res.send({
        message:`Category ${slug} is successfully deleted`,
        success:true,
        category:category.category_name
    })
    } catch(error)
    {
        res.send({
            message:'Something went wrong',
            success:false,
            error:error.message
        })
    } 
}

const getAllCategoriesController=async(req,res)=>{
    try{
        const categories=await CategoryModel.find({}).sort('slug')
        res.send({
            message:'All categories are fetched',
            success:true,
            categories
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

// const getPhotoController=async(req,res)=>{
//     try{
//        const {slug}=req.params
//        const categoryPhoto=await CategoryModel.findOne({slug}).select("photo")
//        if(!categoryPhoto)
//        {
//         return res.send({
//             message:'Category photo does not exist',
//             success:false
//         })
//        }
//        res.send({
//         message:'Photo is fetched',
//         success:true,
//         categoryPhoto
//        })

//     }catch(error)
//     {
//         res.send({
//             message:'Something went wrong',
//             success:false,
//             error:error.message
//         })
//     }
// }

const getSingleCategoryController=async(req,res)=>{
    try{
        const {slug}=req.params
        const category=await CategoryModel.findOne({slug})
        if(!category)
        {
           return res.send({
            message:'Category does not exist',
            success:false
           })
        }
        res.send({
            message:`Category ${category.category_name} is fetched`,
            success:true,
            category
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

const updateSubCategoryController = async (req, res) => {
  try {
    const {subcategory_name}=req.body;
    const {slug,subcategory_id}=req.params;
    if (!subcategory_name) {
      return res.send({message:'Enter subcategory name'});
    }
    const category=await CategoryModel.findOne({slug})
    const existingSubCategory=category.subcategories.filter((subcat)=>subcat.subcategory_id===parseInt(subcategory_id))
    if(!existingSubCategory)
    {
        return res.send({
            message:'Given subcategory cannot be updated as it does not exist',
            success:false
        })
    }
    const updatedCategory = await CategoryModel.findOneAndUpdate(
      {slug,'subcategories.subcategory_id':subcategory_id},
      {$set:{'subcategories.$.subcategory_name':subcategory_name}},{new:true}
    );

    const subcategoryName=existingSubCategory.category_name

    const products=await ProductModel.updateMany({
        subcategory:subcategoryName},{
            $set:{subcategory_name:subcategory_name}
    },{new:true})
    if (!updatedCategory) {
      return res.send({message:'Sub category does not exist'});
    }
    res.send({
      message:`Sub category ${subcategory_name} successfully updated`,
      success:true,
      updatedCategory,
    });
  } catch (error) {
    res.send({
      message:'Something went wrong',
      success:false,
      error:error.message,
    });
  }
};

const deleteSubCategoryController=async(req,res)=>{
    try{
       const {subcategory_id,slug}=req.params
       const category=await CategoryModel.findOne({slug})
       const existingSubCategory=category.subcategories.filter((subcat)=>subcat.subcategory_id===parseInt(subcategory_id))[0]
       if(!existingSubCategory)
       {
            return res.send({
            message:'Sub category cannot be deleted since it does not exist',
            success:false
        })
       }
       const products=await ProductModel.find({subcategory:existingSubCategory.subcategory_name})
       if(products)
       {
          const deletedCategory=await CategoryModel.findOneAndUpdate(
          {slug},{$pull:{subcategories:{subcategory_id}}},{new:true}
          )
          await ProductModel.deleteMany({subcategory:existingSubCategory.subcategory_name})
          return res.send({
            message:`Sub category ${subcategory_id} successfully deleted and all prodcuts of that subcategory also deleted`,
            success:true,
            deletedCategory
       })
       }

      const deletedCategory=await CategoryModel.findOneAndUpdate(
      {slug},{$pull:{subcategories:{subcategory_id}}},{new:true}
      )
     
            res.send({
            message:`Sub category ${subcategory_id} successfully deleted`,
            success:true,
            deletedCategory
       })
      
    } catch(error)
    {
         res.send({
            message:'Something went wrong',
            success:true,
            error:error.message
         })
    }
}

const createSubCategoryController=async(req,res)=>{
    try{
        const {subcategory_id,subcategory_name}=req.body
        const {slug}=req.params 
        if(!subcategory_id)
        return res.send({message:'Enter the subcategory id'})
        if(!subcategory_name)
        return res.send({message:'Enter the subcategory name'})

        const category=await CategoryModel.findOne({slug})
        if(!category)
        return res.send({message:'Category does not exist'})
        
        let existingSubCategory=category.subcategories.filter((subcat)=>subcat.subcategory_id===parseInt(subcategory_id))[0]
        if(existingSubCategory)
        {
            return res.send({
                message:'sub category id already exists',
                success:false
            })
        }
        existingSubCategory=category.subcategories.filter((subcat)=>subcat.subcategory_name===subcategory_name)[0]
        if(existingSubCategory)
        {
            return res.send({
                message:'sub category name already exists',
                success:false
            })
        }
        const subcategory={
            subcategory_name,
            subcategory_id
        }
        category.subcategories.push(subcategory)
        await category.save()

        res.send({
            message:`Sub category ${subcategory_name} successfully created`,
            success:true,
            category
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
module.exports={createCategoryController,updateCategoryController,
    deleteCategoryController,getAllCategoriesController
    ,getSingleCategoryController, createSubCategoryController,
     updateSubCategoryController,deleteSubCategoryController}