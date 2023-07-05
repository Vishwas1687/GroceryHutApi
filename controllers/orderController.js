const OrderModel=require('../models/Order')
const ProductModel=require('../models/Product')
const UserModel=require('../models/User')
const braintree =require("braintree");
const uuid=require('uuid')
const dotenv=require("dotenv");

dotenv.config();

var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const createOrderController=async(req,res)=>{
 try {
    const { nonce, products,shipping_address,total_price} = req.body;
    let total = 0;
    products.map((i) => {
      total += i.price;
    });
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      async function (error, result) {
        if (result) {
          const order =await new OrderModel({
            items: products,
            payment: result,
            customer: req.user._id,
            shipping_address:shipping_address,
            total_amount:total_price,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
}

const updateOrderController=async(req,res)=>{
    try{
        const {status,delivery_in_hours}=req.body
        const {order_id}=req.params
        if(!status)
        return res.send({message:'Enter status'})
        if(!order_id)
        return res.send({message:'Enter order id'})
   
        const existingOrder=await OrderModel.findOne({order_id})

        if(!existingOrder)
        {
            return res.send({
                message:'Order does not exist to update',
                success:false
            })
        }
        let updatedOrder
        if(status==='placed' && existingOrder.status!=='placed')
        {
            return res.send({
                message:'Shipped and delivered orders cant be placed again',
                success:false
            })
        }
        else if(status==='shipping' && !delivery_in_hours)
        {
            return res.send({
                message:'Add delivery in hours',
                success:false
            })
        }
        else if(existingOrder.status!=='delivered' && status!=='delivered')
        {
            updatedOrder=await OrderModel.findOneAndUpdate(existingOrder._id,{
            $set:{delivery_date:new Date(delivery_in_hours * 60 * 60 * 1000+Date.now())||existingOrder.delivery_date,status:status}
        })
        }
        else if(existingOrder.status!=='delivered' && status==='delivered')
        {
             updatedOrder=await OrderModel.findOneAndUpdate(existingOrder._id,{
            $set:{delivery_date:new Date(Date.now()),status:status}})
             return res.send({
                message:'Order successfully updated',
                success:true
             })
        }
        else
        {
            return res.send({
                message:'Delivered orders cant be updated',
                success:false
             })
        }
        

        res.send({
            message:'Order successfully updated',
            success:true,
            updatedOrder
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

const deleteOrderController=async(req,res)=>{
    try{
        const {order_id}=req.params
        if(!order_id)
        return res.send({message:'Enter order id'})

        const existingOrder=await OrderModel.findOne({order_id})
        if(!existingOrder)
        {
            return res.send({
                message:'Order does not exist',
                success:false
            })
        }

        await OrderModel.findByIdAndDelete(existingOrder._id)

        res.send({
            message:'Order has been successfully deleted',
            success:true
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

const getAllOrdersController=async(req,res)=>{
    try{
        const orders=await OrderModel.find({}).
        populate('customer',"username")
        .populate('items.product',"product_name")
        if(orders.length===0)
        {
            return res.send({
                message:'No orders left',
                success:false
            })
        }

        res.send({
            message:'All orders are fetched',
            success:true,
            orders
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

const getSingleOrderController=async(req,res)=>{
    try{
       const {order_id}=req.params
       if(!order_id)
       return res.send({message:'Order Id is not entered'})

       const singleOrder=await OrderModel.findOne({order_id}).populate('customer').populate('items.product')

       if(!singleOrder)
       {
        return res.send({
            message:'The order id does not exist',
            success:false
        })
       }

       res.send({
        message:'Order successfully fetched',
        success:true,
        singleOrder
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

const getOrderByUserController=async(req,res)=>{
    try{

        const user=await UserModel.findById(req.user._id)
        if(!user)
        {
            return res.send({
                message:'User does not exist',
                success:false
            })
        }
        // const thirtyDaysToGo=new Date(Date.now()-30*24*60*60*1000)
        const order=await OrderModel.find({customer:req.user._id
         }).populate('items.product').populate('customer')
        if(order.length===0)
        {
            return res.send({
                message:'User does not have any order',
                success:true
            })
        }
        return res.send({
            message:`All orders of the user ${user.username} is fetched`,
            success:true,
            order
        })
    }catch(error)
    {
         return res.send({
            message:'Something went wrong',
            success:false,
            error:error.message
         })
    }
}

const getPlacedOrdersController=async(req,res)=>{
    try{
        const order=await OrderModel.find({status:'placed'}).populate('items.product').populate('customer')
        if(order.length===0)
        {
            return res.send({
                message:'Do not have any pending orders',
                success:true
            })
        }
        return res.send({
            message:`All pending orders are fetched`,
            success:true,
            order
        })
    }catch(error)
    {
         return res.send({
            message:'Something went wrong',
            success:false,
            error:error.message
         })
    }
}

const getDeliveredOrdersController=async(req,res)=>
{
   try{
        const order=await OrderModel.find({status:'delivered'}).populate('items.product').populate('customer')
        if(order.length===0)
        {
            return res.send({
                message:'Do not have any delivered orders',
                success:true
            })
        }
        return res.send({
            message:`All delivered orders are fetched`,
            success:true,
            order
        })
    }catch(error)
    {
         return res.send({
            message:'Something went wrong',
            success:false,
            error:error.message
         })
    }
}


// const createFeedbackController=async(req,res)=>{
//     try{
//          const {rating,title,body,is_flagged,flag_reason}=req.body
//          const {order_id,user_id,slug}=req.params
//          if(!rating)
//          return res.send({message:'Enter rating'})
//          if(!title)
//          return res.send({message:'Enter title'})
//          if(!body)
//          return res.send({message:'Enter body'})
//          if(!is_flagged)
//          return res.send({message:'Enter flag or not'})
//          if(!flag_reason)
//          return res.send({message:'Enter flag reason'})

//          const user=await UserModel.findOne({user_id})
//          const order=await OrderModel.findOne({customer:user._id,order_id:order_id})
//          const product=await ProductModel.findOne({slug})
         
       
//          let feedbackProduct=order.items.find((pro)=>pro.product.toString()===product._id.toString())

//          if(feedbackProduct.feedback_given)
//          {
//             return res.send({
//                 message:'User has already given the feedback',
//                 success:false
//             })
//          }

//          feedbackProduct={...feedbackProduct,feedback:{
//                user:user._id,
//                product:product._id,
//                order_id:order._id,
//                rating:rating,
//                title:title,
//                body:body,
//                is_flagged:is_flagged,
//                flag_reason:flag_reason
//          }}

//          const feedback=feedbackProduct.feedback

//          const updatedOrder=await OrderModel.findOneAndUpdate({customer:user._id,order_id:order_id,status:'delivered',
//            "items.product":product._id},{$set:{"items.$.feedback":feedback},"items.$.feedback_given":true},{new:true})

//         if(!updatedOrder)
//         {
//             return res.send({
//                 message:'Order is not still delivered to give feedback',
//                 success:false,
//             })
//         }
//          return res.send({
//             message:`Feedback of the product ${product.slug} is received from the user ${user.username} for the order ${order.order_id}`,
//             success:true,
//             updatedOrder
//          })

//     }catch(error)
//     {
//         res.send({
//             message:'Something went wrong',
//             success:false,
//             error:error.message
//         })
//     }
// }

// const getAllFeedbackOfTheProductController=async(req,res)=>{
//      try{
//           const {slug}=req.params
//           const product=await ProductModel.findOne({slug})
//           const orders=await OrderModel.find({"items.product":product._id,"items.feedback_given":true}).populate("items.product")
          
//           const allFeedback=orders.reduce((feedbackarray,order)=>{
//             order.items.filter((item)=>{
//                feedbackarray.push(item.feedback)
//             })
//             return feedbackarray
//           },[])

//           if(allFeedback.length===0)
//           {
//             return res.send({
//                 message:'No feedbacks for the product',
//                 success:false, 
//             })
//           }
//           res.send({
//             message:'All feedback of the product received',
//             success:true,
//             allFeedback
//           })
//      }catch(error)
//      {
//          res.send({
//             message:'Something went wrong',
//             success:false,
//             error:error.message
//          })
//      }
// }

// const getAllFlaggedFeedbackProducts=async(req,res)=>{
//     try{
//          const orders=await OrderModel.find({"items.feedback.is_flagged":true}).populate('items.product')
//          if(orders.length===0)
//          {
//             return res.send({
//                 message:'There are no flagged products',
//                 success:false
//             })
//          }
//          const allProducts=orders.reduce((productarray,order)=>{
//             order.items.filter((item)=>{
//                 productarray.push(item.product)
//             })
//             return productarray
//         },[])
          
//         const uniqueProducts = Array.from(new Set(allProducts)).filter(product => product !== null);
//          res.send({
//             message:'All products that are flagged are fetched',
//             success:true,
//             uniqueProducts:Array.from(uniqueProducts)
//          })
//     }catch(error)
//     {
//          res.send({
//             message:'Something went wrong',
//             success:false,
//             error:error.message
//          })
//     }
// }

// const getFlaggedFeedBackController=async(req,res)=>{
//      try{
//           const {slug}=req.params
//           const product=await ProductModel.findOne({slug})
//           const orders=await OrderModel.find({"items.product":product._id,"items.feedback.is_flagged":true})

//           const allFeedback=orders.reduce((feedbackarray,order)=>{
//             order.items.filter((item)=>{
//                 feedbackarray.push(item.feedback)
//             })
//             return feedbackarray
//           },[])

//           if(allFeedback.length===0)
//           {
//             return res.send({
//                 message:'There is are no flagged feedbacks for this product',
//                 success:false
//             })
//           }

//            res.send({
//                 message:'All flagged feedbacks of the product is fetched',
//                 success:true,
//                 allFeedback
//             })
//      }catch(error)
//      {
//            res.send({
//                 message:'Something went wrong',
//                 success:false,
//                 error:error.message
//             })
//      }
// }

// const getPoorQualityFeedbackController=async(req,res)=>{
//     try{
//           const {slug}=req.params
//           const product=await ProductModel.findOne({slug})
//           const orders=await OrderModel.find({"items.product":product._id,
//           "items.feedback.is_flagged":true,"items.feedback.flag_reason":"product_quality"})

//           const allFeedback=orders.reduce((feedbackarray,order)=>{
//             order.items.filter((item)=>{
//                 feedbackarray.push(item.feedback)
//             })
//             return feedbackarray
//           },[])

//           if(allFeedback.length===0)
//           {
//             return res.send({
//                 message:'There are no poor quality feedbacks for this product',
//                 success:false
//             })
//           }

//            res.send({
//                 message:'All poor quality feedbacks of the product is fetched',
//                 success:true,
//                 allFeedback
//             })
//      }catch(error)
//      {
//            res.send({
//                 message:'Something went wrong',
//                 success:false,
//                 error:error.message
//             })
//      }
// }

// const getPoorQualityProductsController=async(req,res)=>{
//       try{
//          const orders=await OrderModel.find({"items.feedback.is_flagged":true,
//            "items.feedback.flag_reason":"product_quality"}).populate('items.product')
//          if(orders.length===0)
//          {
//             return res.send({
//                 message:'There are no poor quality products',
//                 success:false
//             })
//          }
//          const allProducts=orders.reduce((productarray,order)=>{
//             order.items.filter((item)=>{
//                 productarray.push(item.product)
//             })
//             return productarray
//         },[])
          
//         const uniqueProducts = Array.from(new Set(allProducts)).filter(product => product !== null);
//          res.send({
//             message:'All products that are poor quality are fetched',
//             success:true,
//             uniqueProducts:Array.from(uniqueProducts)
//          })
//     }catch(error)
//     {
//          res.send({
//             message:'Something went wrong',
//             success:false,
//             error:error.message
//          })
//     }
// }

// const deleteFeedbackController=async(req,res)=>{
//       try{
//           const {slug,id}=req.params
//           const product=await ProductModel.findOne({slug})
//           const order=await OrderModel.findOneAndUpdate({"items.product":product._id,
//            "items.feedback._id":id},{"items.$.feedback":null},{new:true})

//           if(!order)
//           {
//             return res.send({
//                 message:'Order does not exist or feedback id does not exist to delete',
//                 success:false,
//             })
//           }

//           res.send({
//             message:'Feedback deleted',
//             success:true,
//             order
//           })
//       }catch(error)
//       {
//           res.send({
//             message:'Something went wrong',
//             success:false,
//             error:error.message
//           })
//       }
// }

module.exports={createOrderController,updateOrderController,
   deleteOrderController,getAllOrdersController,getSingleOrderController,
   getOrderByUserController,getPlacedOrdersController,getDeliveredOrdersController,
   braintreeTokenController
    //  ,createFeedbackController,getAllFeedbackOfTheProductController,
    // getAllFlaggedFeedbackProducts,getFlaggedFeedBackController,getPoorQualityFeedbackController,
    //  getPoorQualityProductsController,deleteFeedbackController
}