var express = require('express');
var router = express.Router();

const {check,validationResult} = require("express-validator");
const {matchedData,sanitizeBody} = require("express-validator");

var jwt = require("jsonwebtoken");

var https_msgs = require("http-msgs");

const userDb = require('../modules/user');
const categoryModel =require('../modules/category');


var bcrypt = require('bcrypt');

function checkLoginUser(req,res,next){
 var userToken = localStorage.getItem('userToken');
  try {
   var decoded = jwt.verify(userToken, 'LoginToken');
  } catch(err) {
    res.redirect('/');
  }
  next();
}

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

function checkEmail(req, res, next){
  const userData = matchedData(req);
  userDb.userModel.findOne({email:req.body.email}).exec((err,data)=>{
    if(err) throw err;

    if(data){
      return res.render('registration',{title:'User Registration Form',success:"This email already exists",user:userData});
    }
    next();
    
  });
}

/* GET home page. */
router.get('/', function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  if(loginUser){
    res.redirect("/dashboard");
  }
  else {
    res.render('index', { title: 'User Login Form' });
  }
});

router.get('/registration', function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  if(loginUser){
    res.redirect("/dashboard");
  }
  else {
    res.render('registration', { title: 'User Registration Form' });
  }
});

router.post('/view_password_detail/',checkLoginUser, function(req, res, next) {
  var getId = req.body;
  var loginUser = localStorage.getItem('loginUser');
  //https_msgs.sendJSON(req,res,{from:"server"});
  console.log(getId.id);

  var catg_name='';

  userDb.passwordModel.findById({_id:getId.id}).exec((err,data)=>{

      if(err) throw err;

      console.log(data.category_id);
      var pswd = data.pswd;
      console.log(data);
      //console.log(data1.category_name);
      https_msgs.sendJSON(req,res,{pswd:pswd,catg_name:catg_name});
      
  });

/*
  categoryModel.findById({_id:data.category_id}).exec((err,data)=>{
    if(err) throw err;
    console.log('hello');
    catg_name = data.category_name;
  });
*/
  

 });


// for adding category and edit category for both
router.get('/add-category/:id?',checkLoginUser, function(req, res, next) {
 var getId = req.params.id;
 var loginUser = localStorage.getItem('loginUser');
 //console.log(getId);

 if(typeof getId!='undefined'){

    categoryModel.findById({_id:getId}).exec((err,data)=>{

      if(err) throw err;

      console.log(data);

      if(data){
        res.render('add-category', { title: 'Add New Category',loginUser:loginUser,action_type:'edit',user:data});
      }
      else {
        res.render('add-category', { title: 'Add New Category',loginUser:loginUser,action_type:'edit',user:''});
      }
    })
 }
 else {
   res.render('add-category', { title: 'Add New Category',loginUser:loginUser,action_type:'add',user:''});
 }

});

router.get('/add-password/:id?',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  var getId = req.params.id;

  categoryModel.find({user_id:localStorage.getItem('UID')},function (err,doc){
    if(err) throw err;

    
    if(typeof getId!='undefined'){
      
      userDb.passwordModel.findOne({_id:getId}).exec((arr,data)=>{
  
        if(arr) throw arr;
          
        if(data){
          res.render('add-password', { title: 'Update Password',loginUser:loginUser,action_type:'edit',user:data,records:doc,test:'vimal'});
        }
        else {
          res.render('add-password', { title: 'Add Password Detail',loginUser:loginUser,action_type:'add',user:'',records:doc});
        }
      });
   }
   else {
      
    res.render('add-password', { title: 'Add Password Detail',loginUser:loginUser,records:doc,action_type:'add',user:''});

   }
     
    
  });
  
 });

router.get('/view-password/:id?',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');

  var getId = req.params.id;
  var msg='';

  if(typeof getId!='undefined' && getId=='add'){
      msg='Password Added Successfully';
  }
  else if(typeof getId!='undefined' && getId=='upd'){
      msg='Password Updated Successfully';
  }
  else if(typeof getId!='undefined' && getId=='del'){
    msg='Password Deleted Successfully';
  }
/*
  userDb.passwordModel.aggregate([
    {
      $lookup:
      {
          from:"category",
          localField:"user_id",
          foreignField:"user_id",
          as:"doc"
      }
    }

  ]).exec(function(err,results){

    if(err) throw err;

    console.log(results);

  });
  */

  
  userDb.passwordModel.find({user_id:localStorage.getItem('UID')},function(err,doc){

    if(err) throw err;

    res.render('view-password', { title: 'View All Password Detail',loginUser:loginUser,records:doc,msg:msg});

  })
  

});

router.get('/view-category/:id?',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  var getId = req.params.id;
  var msg='';
 
 if(typeof getId!='undefined' && getId=='add'){
    msg='Category Added Successfully';
 }
 else if(typeof getId!='undefined' && getId=='upd'){
    msg='Category Updated Successfully';
 }
 else if(typeof getId!='undefined' && getId=='del'){
  msg='Category Deleted Successfully';
}

  categoryModel.find({user_id:localStorage.getItem('UID')},function (err,doc){
    if(err) throw err;
    
    res.render('view-category', {title:'View all Category',loginUser:loginUser,records:doc,msg:msg});
  });
  //res.render('view-category', { title: 'View all Category',loginUser:loginUser});
});

router.get('/user',(req,res,next)=>{
  res.render('index', { title: 'welcome in express' });
});
// for session logout
router.get('/logout',(req,res,next)=>{
  localStorage.removeItem('userToken');
  localStorage.removeItem('loginUser');
  localStorage.removeItem('UID');
  res.redirect('/');
});

// for delete all section

router.get('/delete/:id1/:id2',checkLoginUser,function (req,res,next){
  if(typeof req.params.id1!='undefined' && typeof req.params.id2!='undefined'){
    var action_type = req.params.id1;
    switch(action_type){
     case 'category':
          categoryModel.findByIdAndDelete(req.params.id2).exec(function(err,data){
            if(err) throw err;
            res.redirect('/view-category/del');
          });
        break;
     case 'password':
      userDb.passwordModel.findByIdAndDelete(req.params.id2).exec(function(err,data){
            if(err) throw err;
            res.redirect('/view-password/del');
          });
        break;    

      default: 
        res.redirect('/');
    }
  }
  else {
    res.redirect('/view-category/del');
  }
  //console.log(req.params);
  //next();
});

// POST Method Implementation //
// for adding and edit category both
router.post('/add-password',[
  check('passwordCategory').trim().isLength({min:1}).withMessage('Please Select Password Category'),
  check('managePwd').trim().isLength({min:8}).withMessage('Please Select Password Category')

],
checkLoginUser,(req,res,next)=>{

  const error=validationResult(req);
  const userData = matchedData(req);
  var loginUser = localStorage.getItem('loginUser');
  var action_type = req.body.action_type;

  if(!error.isEmpty()){

    categoryModel.find({user_id:localStorage.getItem('UID')},function (err,doc){
      if(err) throw err;
      res.render('add-password', { title: 'Add Password Detail',loginUser:loginUser,records:doc,error:error.mapped(),user:userData});
    });
  }
  else {

    if(action_type=='edit' && typeof req.body.updId!='undefined'){
      userDb.passwordModel.findByIdAndUpdate({_id:req.body.updId},{category_id:req.body.passwordCategory,pswd:req.body.managePwd},function (err,data){
     if(err) throw err;
        res.redirect('/view-password/upd');
      });
    }
    else {
    //userDb.passwordDetail

   // var pwddb = userDb.passwordDetail;

        var pswd_dtl = new userDb.passwordModel({user_id:localStorage.getItem('UID'),category_id:req.body.passwordCategory,pswd:req.body.managePwd});
        console.log('record saved successfully');
        pswd_dtl.save(function(err,doc){
          if(err) throw err;
          res.redirect('/view-password/add');
        });
      }
  }
})

router.post('/add-category',[check('category_name').trim().isLength({min:2}).withMessage('Please Enter Category')],checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  const error = validationResult(req);
  const userData = matchedData(req);
  var action_type = req.body.action_type;

  if(!error.isEmpty()){
    res.render('add-category', { title: 'Add New Category',loginUser:loginUser,user:userData,error:error.mapped()});
  }
  else {
    if(action_type=='edit' && typeof req.body.updId!='undefined'){
      categoryModel.findByIdAndUpdate({_id:req.body.updId},{category_name:req.body.category_name},function (err,data){
     if(err) throw err;
        res.redirect('/view-category/upd');
      });
    }
    else {

        var uid = localStorage.getItem('UID');
        var categoryDetail = new categoryModel({category_name:req.body.category_name,user_id:uid});
       categoryDetail.save((err,doc)=>{
          if(err) throw err;
          res.redirect('/view-category/add');
        });
      }
   }
 });

router.post('/login',[check('email').trim().isEmail().withMessage('Please Enter Email')
,check('password').trim().isLength({min:3}).withMessage('Please Enter Password')],(req,res)=>{
  const error = validationResult(req);
  const userData = matchedData(req);

    if(!error.isEmpty()){
      res.render('index',{title: 'User Login Form',error:error.mapped(),userData:userData})
    }
    else {
      var useremail = userDb.userModel.findOne({email:req.body.email});

        useremail.exec((err,doc)=>{
          if(err) throw err;

          var getPassword = doc.password;
          var userId = doc._id;

          if(bcrypt.compareSync(req.body.password,getPassword)){
            var token = jwt.sign({userId:userId},'LoginToken');
            localStorage.setItem('userToken',token);
            localStorage.setItem('loginUser',req.body.email);
            localStorage.setItem('UID',userId);
            res.redirect('/dashboard');
          }
          else {
            res.render('index',{title: 'User Login Form',success:'Invalid password',userData:userData})

          }
        })
    }
});

router.post('/registration',[

  check('name').trim().isLength({min:4}).withMessage('Please Enter name'),
  check('email').trim().isEmail().withMessage('Please Enter Email'),
  check('password').trim().isLength({min:5}).withMessage('Please Enter password Minimum 5 Char'),
  check('confpassword').custom((value,{req})=>(value===req.body.password)).withMessage('password not match')],checkEmail,(req,res,next)=>{
  const error = validationResult(req);
  const userData = matchedData(req);  
  //console.log(error);

  if(!error.isEmpty()){
    res.render('registration',{title: 'User Registration Form',error:error.mapped(),user:userData});
  }
  else {

    var password = bcrypt.hashSync(req.body.password,10);
    var userModelDetail = new userDb.userModel({name:req.body.name,email:req.body.email,password:password});
    userModelDetail.save((err,doc)=>{
      if(err) throw err;
       res.render('registration',{title:'User Registration Form',success:"User Created Successfully"});
    });
    
 }
});

router.put('/api',function(req,res){

  res.json({name:"vimal",age:"35"});

});




module.exports = router;
