const jwt=require('jsonwebtoken')
const UserModel=require('../models/User')
const requiresSignIn=async(req,res,next)=>{
    try{
       const decode= jwt.verify(
        req.headers.authorization, process.env.JWT_TOKEN)
        req.user=decode
        next()
    }catch(error)
    {
        res.status(404).send({
            message:'Something went wrong',
            success:false,
            error:error
        })
    }
}

const isAdmin=async(req,res,next)=>{
    try{
        const User=await UserModel.findById(req.user._id)
        if(User.role !== 1)
        {
            return res.status(404).send({
                message:'User is not the admin',
                success:false
            })
        }
        else next()
    }catch(error)
    {
        res.status(404).send({
            message:'Something went wrong',
            success:false,
            error
        })
    }
}
module.exports={requiresSignIn,isAdmin};