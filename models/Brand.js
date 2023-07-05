const mongoose=require('mongoose')
const {Schema,model}=mongoose
const uuid = require('uuid')

const BrandSchema=new Schema({
       brand_id:{
        type: String,
        default: () => uuid.v4().replace(/-/g, '').slice(0, 4)
        },
        brand_name:{
            type:String,
            required:true,
            unique:true
        }
},{timestamps:true})

module.exports=model('Brand',BrandSchema)