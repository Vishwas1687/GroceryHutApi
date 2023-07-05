const express=require('express')
const router=express.Router()

const {createBrandController,updateBrandController,
       deleteBrandController,getAllBrandsController,
       getAllBrandsCategoryController,getAllBrandsSubCategoryController}=require('../controllers/brandController')

router.post('/create-brand',createBrandController)

router.put('/update-brand/:brand_id',updateBrandController)

router.delete('/delete-brand/:brand_id',deleteBrandController)

router.get('/get-all-brands',getAllBrandsController)

router.get('/get-all-brands-by-cat/:slug',getAllBrandsCategoryController)

router.get('/get-all-brands-by-subcat/:slug/:subcategory_id',getAllBrandsSubCategoryController)
module.exports=router
