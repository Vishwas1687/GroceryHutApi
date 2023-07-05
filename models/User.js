const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const uuid = require('uuid')
const UserSchema = new Schema({
  google_id:{
      type:String
  },
  user_id:{
    type:String,
    default: () => uuid.v4().replace(/-/g, '').slice(0, 4)
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    // required: true,
    // unique: true,
    // index: true,
  },
  password: {
    type: String,
    // required: true,
  },
  address: String,
  answer:{
    type:String,
    // required:true
  },
  phone_number:
  {
    type:String,
    // required:true
  },
  role:{
    type:Number,
    default:0
  }
}, { timestamps: true });

module.exports = model('User', UserSchema);