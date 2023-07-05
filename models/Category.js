const mongoose=require('mongoose')
const {model,Schema} =mongoose;
const SubCategorySchema=new Schema({
    subcategory_id:{
        type:Number,
        required:true
    },
    subcategory_name:{
        type:String,
        required:true
    },
    // photo:{
    //     data:Buffer,
    //     contentType:String
    // }
})
const CategorySchema=new Schema({
    category_id:{
        type:Number,
        required:true,
        unique:true
    },
    category_name:{
        type:String,
        required:true
    },
    slug:{
        type:String,
        required:true
    },
    subcategories:{
        type:[SubCategorySchema],
        required:true,
        validate: [
        {
        validator: function (subcategories) {
          // Iterate over all subcategories and ensure that each subcategory_id
          // is unique within this category
          const subcategoryIds = new Set();
          const subcategoryNames = new Set();
          for (const subcategory of subcategories) {
            if (subcategoryIds.has(subcategory.subcategory_id)) {
              return false;
            }
            subcategoryIds.add(subcategory.subcategory_id);
          }

          for(const subcategory of subcategories)
          {
            if(subcategoryNames.has(subcategory.subcategory_name))
            {
              return false;
            }
            subcategoryNames.add(subcategory.subcategory_name)
          }

          return true;
        },
        message: 'Subcategory IDs must be unique within a category',
      },
    ],
    },
    //   photo:{
    //     data:Buffer,
    //     contentType:String
    // }

})
module.exports=model('SubCategory',SubCategorySchema)
module.exports=model('Category',CategorySchema)