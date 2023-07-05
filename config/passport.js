const GoogleStrategy=require('passport-google-oauth20').Strategy
const mongoose=require('mongoose')
const jwt=require('jsonwebtoken')
const UserModel=require('../models/User')
const dotenv=require('dotenv')
dotenv.config()

module.exports = function(passport){
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:'/api/auth/google/callback'
    },
    async (accessToken,refreshToken,profile,done)=>{
        console.log(profile)
        const newUser={
            google_id:profile.id,
            googleAccessToken: accessToken,
            username:profile.displayName,
            email:profile.emails[0].value,
            
        }

        try{
            let user=await UserModel.findOne({google_id:profile.id})
            if(user)
            {
                
                done(null,user)
            }
            else{
                const createdUser=await new UserModel({
                       google_id:profile.id,
                       username:profile.displayName,
                       email:profile.emails[0].value,
                       
                }).save()
                done(null, createdUser);
            }
        }catch(error)
        {
            console.error(error)
        }
    }))

    passport.serializeUser((user,done)=>{
        done(null,user.id)
    })

     passport.deserializeUser(async(id,done)=> {
        try{
        const user=await UserModel.findById(id)
        return done(null,user)
        }catch(error)
        {
            console.error(error)
           return done(error)
        }
    })
}