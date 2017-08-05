var express = require('express');
var router = express.Router();
var User = require("../models/User");
var Category = require("../models/Category");
var Content = require("../models/Content");

router.use(function(req,res,next){
    if(!req.userInfo.isAdmin){
        res.end("只有管理员才有权限登录");
        return;
    }
    next();
});
router.get("/",function(req,res,next){
    res.render("admin/index",{
        userInfo:req.userInfo
    })
    //res.send("后台管理首页");
})

router.get("/user",function(req,res,next){
    //从数据库中读取数据展示到界面上,limit限制获取的条数
    //skip(2)忽略数据的条件，从第三条开始取
    //如果需要每页显示两条,skip(0),第二页skip(2)
    //每页显示2条
    //1:1-2 skip(0)  ->(当前页-1)*limit
    //2:3-4  skip(2)  ->

    var page = Number(req.query.page || 1);//验证page是否为数字
    var limit = 2;
    var pages =0;
    User.count().then(function(count){
        //计算总页数
        pages = Math.ceil(count/limit);
        page = Math.min(page,pages);//取值不能超过pages
        page = Math.max(page,1);
        var skip = (page-1)*limit;
        User.find().limit(limit).skip(skip).then(function(users){
            res.render("admin/user",{
                userInfo:req.userInfo,
                users:users,
                count:count,
                pages:pages,
                limit:limit,
                page:page
            })
        })
    })

});
router.get("/category",function(req,res,next){
    var page = Number(req.query.page || 1);//验证page是否为数字
    var limit = 2;
    var pages =0;
    Category.count().then(function(count){
        //计算总页数
        pages = Math.ceil(count/limit);
        page = Math.min(page,pages);//取值不能超过pages
        page = Math.max(page,1);
        var skip = (page-1)*limit;
        //sort 1升序；-1降序
        Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function(categories){
            res.render("admin/category",{
                userInfo:req.userInfo,
                categories:categories,
                count:count,
                pages:pages,
                limit:limit,
                page:page
            })
        })
    })
})
router.get('/category/add',function(req,res,next){
    res.render('admin/category_add',{
        userInfo:req.userInfo
    });
});
router.post('/category/add',function(req,res,next){
    var name = req.body.name || '';
    if(name ==''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'名称不能为空',
            url:''
        });
        return;
    }
    //是否存在同名
    Category.findOne({
        name:name
    }).then(function(rs){
        if(rs){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'该名称已经存在'
            })
            return Promise.reject();
        }else{
            return new Category({
                name:name
            }).save();
        }
    }).then(function(newcategory){
        res.render("admin/success",{
            userInfo:req.userInfo,
            message:"分类保存成功",
            url:'/admin/category/add'
        });
    })
});

router.get("/category/update",function(req,res){
    //获取要修改的分类信息并且用表单的形式展现出来
    var id = req.body.id;
    Category.findOne({
        id:id
    }).then(function(category){
        if(category){
            res.render('admin/category_update',{
                userInfo:req.userInfo,
                category:category
            })
        }else{
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'修改出错，请再试一次'
            })
            return Promise.reject();
        }
    })
});
router.post('/category/update',function(req,res){
    var id = req.query.id || '';

    var name = req.body.name || '';
    if(name ==''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'名称不能为空'
        });
        return;
    }

    //是否存在同名
    Category.findOne({
        _id:id
    }).then(function(rs){
        if(!rs){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'该分类不存在'
            })
            return Promise.reject();
        }else{
            if(name == rs.name){
                res.render('admin/success',{
                    userInfo:req.userInfo,
                    message:'信息修改成功',
                    url:'/admin/category'
                })
            }else{
                return Category.findOne({
                    _id:{$ne:id},
                    name:name
                });
            }
        }
    }).then(function(samecategory){
        if(samecategory){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'该名称已经存在'
            })
            return Promise.reject();
        }else{
            return Category.update({
                _id:id
            },{
                name:name
            })
        }
    }).then(function(){
        res.render("admin/success",{
            userInfo:req.userInfo,
            message:"分类修改成功",
            url:'/admin/category'
        });
    })
});

router.get("/category/delete",function(req,res){
    var id = req.query.id || '';
    Category.remove({
        _id:id
    }).then(function (){
        res.render("admin/success",{
            userInfo:req.userInfo,
            message:"删除成功",
            url:'/admin/category'
        });
    })
});

router.get("/content",function(req,res){
    var page = Number(req.query.page || 1);//验证page是否为数字
    var limit = 2;
    var pages =0;
    Content.count().then(function(count){
        //计算总页数
        pages = Math.ceil(count/limit);
        page = Math.min(page,pages);//取值不能超过pages
        page = Math.max(page,1);
        var skip = (page-1)*limit;
        //sort 1升序；-1降序
        Content.find().sort({_id:-1}).limit(limit).skip(skip).populate(['category','user']).then(function(contents){
            console.log(contents);
            res.render("admin/content",{
                userInfo:req.userInfo,
                contents:contents,
                count:count,
                pages:pages,
                limit:limit,
                page:page
            })
        })
    })
});
router.get("/content/add",function(req,res){
    Category.find().sort({_id:-1}).then(function(categories){
        res.render("admin/content_add",{
            userInfo:req.userInfo,
            categories:categories
        })
    })
});
router.post("/content/add",function(req,res){
    if(req.body.category==''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'分类不能为空'
        })
        return;
    }
    if(req.body.title==''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'标题不能为空'
        })
        return;
    }
    //保存数据到数据库
   new Content({
        category:req.body.category,
        title:req.body.title,
        user:req.userInfo._id.toString(),
        des:req.body.des,
        con:req.body.con
    }).save().then(function(rs){
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'内容保存成功',
            url:'/admin/content'
        })
    });
});
router.get("/content/update",function(req,res){
    var id = req.query.id || '';
    var categories = [];
    Category.find().sort({_id:-1}).then(function(categories){
        categories = categories
        return Content.findOne({
            _id:id
        }).populate('category')
    }).then(function(content){
        if(!content){
            res.render("admin/error",{
                userInfo:req.userInfo,
                message:'该内容不存在'
            })
            return Promise.reject();
        }else{
            res.render("admin/content_update",{
                userInfo:req.userInfo,
                categories:categories,
                content:content
            })
        }
    })

});
router.post('/content/update', function (req, res) {
    var id =req.query.id || ''

    if (req.body.category == ''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'内容的分类不能为空'
        })
        return
    }
    if (req.body.title == ''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'内容的标题不能为空'
        })
        return
    }

    Content.update({
        _id:id
    },{
        category:req.body.category,
        title:req.body.title,
        des:req.body.des,
        con:req.body.con
    }).then(function (rs) {
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'保存成功',
            //url:'/admin/content/edit?id=' + id
            url:'/admin/content'
        })
    })
})
router.get("/content/delete",function(req,res){
    var id = req.query.id || '';
    Content.remove({
        _id:id
    }).then(function (){
        res.render("admin/success",{
            userInfo:req.userInfo,
            message:"删除成功",
            url:'/admin/content'
        });
    })

})
module.exports = router;