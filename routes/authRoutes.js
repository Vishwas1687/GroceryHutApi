const express=require('express')
const jwt=require('jsonwebtoken')
const dotenv=require('dotenv')
const passport= require('passport')
const UserModel=require('../models/User')
const {registerController,loginController,
    forgotPasswordController,getAllUsersController,
    updateProfileController,getSingleUserController}=require('../controllers/authController')

const {requiresSignIn,isAdmin}=require('../middlewares/authmiddleware')
const router=express.Router()

dotenv.config()
// auth with google
router.get('/google',passport.authenticate('google',{scope:['profile','email']}),async(req,res)=>{ 
})
// google auth callback
router.get('/google/callback',passport.authenticate('google',{failureRedirect:'http://localhost:3000'}),
  async(req,res)=>{
    const token = jwt.sign({ _id: req.user._id }, process.env.JWT_TOKEN, { expiresIn: '365d' });
    // const existingUser=await UserModel.findById(req.user._id)
    // const user={
    //    username:req.user.username,
    //    email:req.user.email,
    //    address: encodeURIComponent(existingUser.address),
    //     phone_number: encodeURIComponent(existingUser.phone_number)
    // }
     res.redirect(`${process.env.FRONTEND_URL}/sample?token=${token}`);
    //  res.status(200).send({
    //   success: true,
    //   token: token,
    // });
  })

// router.get('/test/google', async (req, res) => {
//   // Access the token from the query parameter
//   const token = req.query.token;
  
//   // Do any necessary processing with the token in the backend

//   // Send the token back to the frontend
//   res.send({ token });
// });

router.post('/login',loginController)


router.post('/register',registerController)

router.put('/forgot-password',forgotPasswordController)

router.get('/test',requiresSignIn,isAdmin,(req,res)=>{
    res.send({message:'Protected Routes'})
})

// protected routes

router.get('/user-auth',requiresSignIn,(req,res)=>{
    res.status(200).send({ok:true});
})

router.get('/admin-auth',requiresSignIn,isAdmin,(req,res)=>{
    res.status(200).send({ok:true});
})

router.put('/update-profile',requiresSignIn,updateProfileController)

router.get('/get-all-users',requiresSignIn,isAdmin,getAllUsersController)

router.get('/get-single-user/:token',getSingleUserController);

module.exports=router;