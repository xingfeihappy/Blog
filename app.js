//入口文件
var express = require('express');
//加载魔板，是前后分离
var swig = require('swig');
//加载数据库
var mongoose = require('mongoose');
/*app = noejs中的http的server*/
/*创建应用*/
//加载body-parse，用来处理post提交过来的数据
var bodyParser = require('body-parser');
//记载cookie模块
var cookies = require('cookies');
var User = require('./models/User')
var app = express();

//定义当前应用使用的模板引擎,第一个参数是模板引擎的名称，也是模板文件的后根，
// 第二个参数表示用于解析处理模板内容的方法
app.engine('html',swig.renderFile);
//设置模板文件存放的目录，第一个参数必须是views；第二个参数是目录
app.set('views','./views');
//注册所使用的模板引擎,第一个参数必须是view engine，第二个参数和app.engine这个方法中定义的模板引擎的名称一致
app.set('view engine','html');
//在开发过程中需要取消模板的缓存,避免每次修改都要重启文件
swig.setDefaults({cache:false});
/*
//首页
app.get("/",function(req,res,next){
    //读物views目录下的文件，解析并返回给客户端，第一参数表示模板文件相对于views目录
    //第二个参数表示传给模板的数据
    res.render('index');
    //res.send("welcome my blob");
})*/
//请求css文件
/*app.get('/main.css',function(req,res,next){
    res.setHeader('content-type':'text/css');
    res.send('body{background:red}');
})*/

//设置静态文件托管
//访问路径以/public开头，就直接会返回这个文件路径下public文件夹下的文件
app.use('/public',express.static(__dirname+'/public'));

//body-parse设置
app.use(bodyParser.urlencoded({extended:true}));

//设置cookies，用于保存用户的登录状态
//这些都是中间件，没有写路径的中间件，每一个请求都会执行
app.use(function(req,res,next){
    req.cookies = new cookies(req,res);

    //解析登录用户的用户信息；
    req.userInfo = {};
    if(req.cookies.get("userInfo")){
        try{
            req.userInfo = JSON.parse(req.cookies.get("userInfo"));
            //获取当前登录用户的类型
            User.findById(req.userInfo._id).then(function(userInfo){
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
                next();
            })

        }catch(e){
            next();
        }
    }else{
        next();
    }
})

//根据不同的功能划分模块，将路由挂载至应用
app.use('/admin',require('./routers/admin'));
app.use('/api',require('./routers/api'));
app.use('/',require('./routers/main'));

//连接数据库
mongoose.connect('mongodb://localhost:27017/blog',function(err){
    if(err){
        console.log("数据库连接失败");
    }else{
        console.log("数据库连接成功");
        //监听http请求
        app.listen(8081);
    }
});
