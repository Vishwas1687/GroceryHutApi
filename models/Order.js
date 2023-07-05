const mongoose = require('mongoose');
const { Schema,model } = mongoose;
const uuid=require('uuid')

// const FeedbackSchema = new Schema({
//   user: {
//     type: mongoose.ObjectId,
//     ref: 'User',
//     required: true,
//   },
//   product: {
//     type: mongoose.ObjectId,
//     ref: 'Product',
//     required: true,
//   },
//   order: {
//      type: mongoose.ObjectId,
//      ref: 'Order',
//      required: true,
//   },
//   rating: {
//     type: Number,
//     required: true,
//     min: 1,
//     max: 5,
//   },
//   title: {
//     type: String,
//     required: true,
//     minlength: 1,
//     maxlength: 100,
//   },
//   body: {
//     type: String,
//     required: true,
//     minlength: 1,
//     maxlength: 1000,
//   },
// //   images: [
// //     {
// //       type: String,
// //       required: true,
// //     },
// //   ],
//   is_flagged: {
//     type: Boolean,
//     default: false,
//   },
//   flag_reason: {
//   type: String,
//   enum: ['inappropriate', 'spam', 'offensive', 'product_quality', 'delivery_time', 'customer_service', 'not_satisfied_product'],
//   validator:{
//     validate:async function(v)
//     {
//       const en=['inappropriate', 'spam', 'offensive', 'product_quality', 'delivery_time', 'customer_service', 'not_satisfied_product']
//       return en.includes(v)
//     },
//     message:props=>`${props.value} is not a valid flag reason`
//   },
//   default: null
// }
// }, { timestamps: true });

const OrderSchema = new Schema({
  order_id: {
    type: String,
    default: ()=> uuid.v4().replace(/-/g,'').slice(0,5)
  },
  customer: {
    type: mongoose.ObjectId,
    ref: 'User',
    required: true
  },
  payment:{},
  items: [{
    product: {
      type: mongoose.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    weight:{
        type:Number,
        required:true
    },
    weight_units:{
        type:String,
        required:true
    },
    price: {
      type: Number,
      required: true
    },
    // feedback:FeedbackSchema,
    // feedback_given:{
    //     type:Boolean,
    //     default:false
    // }
  }],
  status: {
    type: String,
    enum: ['placed', 'processing', 'shipped', 'delivered'],
    default: 'placed'
  },
  shipping_address:{
    type:String,
    required:true
  },
  total_amount: {
    type: Number,
    required: true
  },
  order_date: {
    type: Date,
    default: Date.now
  },
  delivery_date: {
    type: Date
  },
  // cancellation_date: {
  //   type: Date
  // },
  // reason_for_cancellation: {
  //   type: String
  // }
},{timestamps:true});

// OrderSchema.path('items.feedback').required(false)

// module.exports=model('Feedback',FeedbackSchema)
module.exports = model('Order', OrderSchema);
