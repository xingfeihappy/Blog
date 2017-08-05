var mongoose = require('mongoose');
module.exports = new mongoose.Schema({
    //本质来说是一个关联字段
    category: {
        //类型
        type:mongoose.Schema.Types.ObjectId,
        //引用的模型,model里面的
        ref:'Category'
    },
    title: String,
    user: {
        //类型
        type:mongoose.Schema.Types.ObjectId,
        //引用的模型,model里面的
        ref:'User'
    },
    views:{
        type:Number,
        default:0
    },
    addTime:{
        type:Date,
        default:new Date()
    },
    des: {
        type:String,
        default:''
    },
    con: {
        type:String,
        default:''
    }
});