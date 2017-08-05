var express = require('express');
var router = express.Router();
var User = require('../models/User');
//统一返回格式
var responseData;
router.use(function(req,res,next){
    responseData = {
        code:'0',
        message:''
    }
    next();
});

//验证
//1.用户名不能为空；2.密码不能为空；3.再次输入密码是否一致
//数据库：1.用户名是否已经注册
router.post('/user/register',function(req,res,next){

    var username = req.body.username;
    var password = req.body.password;
    var repasswrod = req.body.repassowrd;
    if(username == ''){
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        res.json(responseData);
        return;
    }
    if(password == ''){
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json(responseData);
        return;
    }
    if(password != repasswrod){
        responseData.code = 3;
        responseData.message = '两次输入密码不一致';
        res.json(responseData);
        return;
    }
    //验证数据库
    User.findOne({
        username:username
    }).then(function(userInfo){
        console.log("userInfo:"+userInfo);
        if(userInfo){
            responseData.code = '4';
            responseData.message='用户名已被注册';
            res.json(responseData);
            return;
        }else{
            //保存用户注册信息到数据库
            var user= new User({
                username:username,
                password:password
            });
            return user.save();
        }
    }).then(function(newuserInfo){
        console.log(newuserInfo);
        responseData.code='5';
        responseData.message = '注册成功';
        res.json(responseData);
    })


    console.log('data：'+req.body);
});

router.post('/user/login',function(req,res,next){
    var username = req.body.username;
    var password = req.body.password;
    if(username == '' || password == ''){
        responseData.code=1;
        responseData.message='用户名或者密码不能为空';
        res.json(responseData);
    }
    User.findOne({
        username:username,
        password:password
    }).then(function(userInfo){
        console.log("userInfo；"+userInfo)
        if(userInfo){
            responseData.code = 2;
            responseData.message='登录成功';
            responseData.userInfo = {
                _id:userInfo._id,
                username:userInfo.username
            };
            console.log("要设置cookie了");
            req.cookies.set("userInfo",JSON.stringify({
                _id:userInfo._id,
                username:userInfo.username
            }));
            console.log("cookie1:"+req.cookies.get("userInfo"));
            console.log("登陆成功");
            res.json(responseData);
            return ;
        }else{
            console.log("登录失败");
            responseData.code = 3;
            responseData.message="用户名密码错误";
            res.json(responseData);
            return;
        }
    })
});
router.get("/user/logout",function(req,res,next){
    req.cookies.set('userInfo',null);
    responseData.code="9"
    res.json(responseData);
})

module.exports = router;