import mongoose from "mongoose";
// Using this message model we can store message data in database
const messageSchema=new mongoose.Schema({
    senderId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    receieverId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    text:{type:String},
    image:{type:String},
    seen:{type:Boolean,default:false},

    
},{timestamps:true})

const Message=mongoose.model("Message",messageSchema);

export default Message;