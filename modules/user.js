var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/testing',{useNewUrlParser:true,useCreateIndex:true});
var con = mongoose.connection;

con.on("error", console.error.bind(console, "connection error:"));
    con.once("open", function callback(){
        console.log("CONNECTED");
 });

 var userSchema = new mongoose.Schema({
    name:{type:String,
          required:true},
    email:{type:String,
            required:true,
            index:{unique:true}
           }, 
    password:{ type:String,required:true},   
    date:{type:Date,default:Date.now}
 });

 var userModel = mongoose.model('users',userSchema,'users');

 var passwordDetail = new mongoose.Schema({
    user_id:{type:String,required:true},
    category_id:{type:String,required:true},
    pswd:{type:String,required:true},
    added_date:{type:Date,default:Date.now()}
 });

 var passwordModel = mongoose.model('passworddtl',passwordDetail,'passworddtl');

module.exports.passwordModel = passwordModel;
module.exports.userModel = userModel;




