var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/testing',{useNewUrlParser:true,useCreateIndex:true});
var con=mongoose.connection;

con.on("error", console.error.bind(console, "connection error:"));
    con.once("open", function callback(){
        console.log("CONNECTED");
 });

 var categorySchema = new mongoose.Schema({
    category_name:{type:String,required:true},
    user_id:{type:String,required:true},
    date:{type:Date,default:Date.now}
 });

 var categoryModel = mongoose.model('category',categorySchema,'category');
 module.exports = categoryModel;