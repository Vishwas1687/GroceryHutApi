const express=require('express')
const formidable=require('express-formidable')
const router=express.Router()

const {createCategoryController,
    updateCategoryController,deleteCategoryController,
    getAllCategoriesController,
     getSingleCategoryController, createSubCategoryController,
    updateSubCategoryController,deleteSubCategoryController}=require('../controllers/categoryController')

const {requiresSignIn,isAdmin}=require('../middlewares/authmiddleware')

router.post('/create-category',requiresSignIn,isAdmin,createCategoryController)

router.put('/update-category/:slug',requiresSignIn,isAdmin,updateCategoryController)

router.delete('/delete-category/:slug',requiresSignIn,isAdmin,deleteCategoryController)

router.get('/get-category/:slug',getSingleCategoryController)

router.put('/get-category/:slug/:subcategory_id/edit',requiresSignIn,isAdmin,updateSubCategoryController)

router.delete('/get-category/:slug/:subcategory_id/delete',requiresSignIn,isAdmin,deleteSubCategoryController)

router.post('/get-category/:slug/new',requiresSignIn,isAdmin,createSubCategoryController)

router.get('/get-all-categories',getAllCategoriesController)

// router.get('/get-photo/:slug',getPhotoController)


module.exports=router

