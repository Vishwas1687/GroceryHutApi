const mongoose=require('mongoose')
const CategoryModel=require('./Category')
const uuid = require('uuid')

const {model,Schema} =mongoose;
const WeightsSchema=new Schema({
    weight_id:{
        type:Number,
        required:true
    },
    weight:{
        type:Number,
        required:true
    },
    weight_units:{
        type:String,
        required:true
    },
    mrp:{
        type:Number,
        required:true
    },
    sp:{
        type:Number,
        required:true
    },
    stock:{
        type:Number,
        required:true
    },
})
const ProductSchema=new Schema({
    product_id:{
        type: String,
        default: () => uuid.v4().replace(/-/g, '').slice(0, 4)
    },
    product_name:{
        type:String,
        required:true,
        unique:true
    },
    seller_id:{
        type:Number,
        default:0
    },

    slug:{
        type:String,
        required:true,
        lowercase:true
    },
    brand:{
        type:mongoose.ObjectId,
        ref:'Brand',
        required:true
    },
    weights:{
       type:[WeightsSchema],
       required:true,
       validate:{
        validator:async function(weights){
            const weightIds=new Set()
            for(const weight of weights)
            {
                if(weightIds.has(weight.weight_id))
                return false
                weightIds.add(weight.weight_id)
            }
            return true
        },
        message:`Weight ids are not a valid weight id`
       }
    },
    category:{
        type:mongoose.ObjectId,
        ref:'Category',
        required:true,
    },
    subcategory:{
        type:String,
        required:true,
        validate:{
            validator:async function(v)
            {
                const category=await CategoryModel.findById(this.category)
                return category.subcategories.some((sub) => sub.subcategory_name === v);
            },
            message:props=>`${props.value} is not a valid subcategory of this category`
        },
    },
    tags:{
        type:[String],
        required:true
    },
      photo:{
        data:Buffer,
        contentType:String
    }

},{timestamps:true})

module.exports=model('Product',ProductSchema)

