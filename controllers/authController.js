const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken')
const UserModel = require('../models/User');

const registerController = async (req, res) => {
  try {
    const {username, email, address,password, confirmPassword, phone_number,answer} = req.body;
    if(!username)
    return res.send({message:'Username is not entered'})
    if(!email)
    return res.send({message:'Email is not entered'})
    if(!password)
    return res.send({message:'Password is not entered'})
    if(!confirmPassword)
    return res.send({message:'Password is not confirmed'})
    if(!phone_number)
    return res.send({message:'Phone Number is not entered'})
    if(!answer)
    return res.send({message:"Enter your favourite food"})

    const existingUser=await UserModel.findOne({email:email})
    if(existingUser)
    {
        return res.status(201).send({
            success:false,
            message:"User already exists"
        })
    }
    if(password!=confirmPassword)
    {
        return res.status(404).send({
            success:false,
            message:"Confirm the password"
        })
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedAnswer = await bcrypt.hash(answer,10);
    
    // Save the user to the database
    const newUser = await new UserModel({
    
      username: username,
      email: email,
      password: hashedPassword,
      phone_number: phone_number,
      address:address,
      answer:hashedAnswer
    }).save();

    res.status(201).send({
      success: true,
      message: "Successfully registered",
      user:{
        username:newUser.username,
        email:newUser.email,
        phone_number:newUser.phone_number,
        address:newUser.address
      },
    });
  } catch (error) {
    console.error(error);
    res.status(404).send({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

const loginController=async(req,res)=>{
   try{
   const {email,password}=req.body;
   if(!email)
   return res.send({message:'Email is not entered'})
   if(!password)
   return res.send({message:'Password is not entered'})
   const existingUser=await UserModel.findOne({email})
   if(!existingUser)
   {
    return res.status(404).send({
        message:"Email does not exist",
        success:false
    })
   }
   const match=await bcrypt.compare(password,existingUser.password)
   if(!match)
   {
    return res.status(404).send({
        success:false,
        message:"Wrong password"
    })
   }
   const token=jwt.sign({_id:existingUser._id},process.env.JWT_TOKEN,{expiresIn:'365d'})
   res.status(200).send({
    success:true,
    user:{
        username:existingUser.username,
        address:existingUser.address,
        phone_number:existingUser.phone_number,
        email:existingUser.email
    },
    token:token,
    message:'Logged In',
   })
   }catch(error){
    res.status(404).send({
        message:"Something went wrong",
        success:false
    })
   }
}

const forgotPasswordController=async(req,res)=>{
    try{
      const {email,password,confirmPassword,answer}=req.body;
      if(!email)
      return res.send({message:'Email is required'})
      if(!password)
      return res.send({message:'Create a new password'})
      if(!confirmPassword)
      return res.send({message:'Confirm the password'})
      if(!answer)
      return res.send({message:'Answer is wrong'})
      
      const user=await UserModel.findOne({email})
      if(!user)
      {
        return res.status(404).send({
            message:"User is not registered",
            success:false
        })
      }
      const match=await bcrypt.compare(answer,user.answer)
      if(!match)
      {
        return res.status(404).send({
            message:"Not the correct answer",
            success:false,
        })
      }
      if(password!=confirmPassword)
      {
        return res.status(404).send({
            success:false,
            message:"Passwords do not match"
        })
      }
      const hashedPassword=await bcrypt.hash(password,10);
      const updatedUser=await UserModel.findByIdAndUpdate(user._id,{password:hashedPassword})
      res.status(200).send({
        success:true,
        message:"Password is changed",
        user:{
          username:updatedUser.username,
          address:updatedUser.address,
          phone_number:updatedUser.phone_number
        }
      })
    }catch(error){
        res.status(404).send({
            message:"Something went wrong",
            success:true
        })
    }
}

const updateProfileController=async(req,res)=>{
    try{
    const {username,password,phone_number,address,answer}=req.body
    
    if(!username)
    {
      return res.send({message:'Username is not entered'})
    }
    if(!phone_number)
    {
      return res.send({message:'User phone number is not entered'})
    }
    if(!address)
    {
      return res.send({message:'User address is not entered'})
    }
    let hashedPassword
    let hashedAnswer
    if(password)
    {
      hashedPassword=await bcrypt.hash(password,10)
    }
    if(answer)
    {
      hashedAnswer=await bcrypt.hash(answer,10)
    }
    
    const User=await UserModel.findById(req.user._id)
    if(!User)
    {
      return res.send({message:'User does not exist'})
    }

    const updatedUser=await UserModel.findByIdAndUpdate(User._id,{
        user_id:User._id,
        username:username,
        email:User.email,
        password:hashedPassword||User.password,
        phone_number:phone_number,
        address:address,
        answer:hashedAnswer||User.answer
    },{new:true})

    res.send({
      message:'User Profile updated',
      success:true,
      user:{
        username:updatedUser.username,
        phone_number:updatedUser.phone_number,
        address:updatedUser.address
      }
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

const getAllUsersController=async(req,res)=>{
  try{
    const users=await UserModel.find({role:0})
    if(users.length===0)
    return res.send({
      message:'There are no users',
      success:false
    })
    res.send({
      message:'Users are fetched',
      success:true,
      users
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

const getSingleUserController=async(req,res)=>{
     try{
       const {token}=req.params
       const decode=jwt.verify(req.headers.authorization, process.env.JWT_TOKEN)
       req.user=decode
       const User=await UserModel.findById(req.user._id)
       if(!User)
       {
           return res.send({
           message:'User is not valid and is not authorised',
          success:false
          })
        }
        res.send({
          message:'User data is fetched',
          success:true,
          user:User
        })
     }catch{
          res.send({
            message:'Something went wrong',
            success:false,
            error:error.message
          })
     }
}


module.exports = { registerController,loginController,getSingleUserController,
  forgotPasswordController,updateProfileController,getAllUsersController};