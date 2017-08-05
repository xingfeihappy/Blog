var express = require('express');
var router = express.Router();
var Category = require("../models/Category");
router.get('/',function(req,res,next){


    var data ={
        page : Number(req.query.page || 1),//验证page是否为数字
        limit : 2,
        pages : 0
    }
    Category.find().then(function(categories){
        res.render("main/index",{
            userInfo:req.userInfo,
            categories:categories
        });//第二个参数就是分配给模块使用的数组
    })

})

module.exports = router;