var express = require('express');
var router = express.Router();

const {check,validationResult} = require("express-validator");
const {matchedData,sanitizeBody} = require("express-validator");

var jwt = require("jsonwebtoken");

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


router.get('/',checkLoginUser, function(req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    res.render('dashboard', { title: 'Welcome to user Password management System Login',loginUser:loginUser});
  });

  module.exports = router;