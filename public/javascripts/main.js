$(document).ready(function(){

    showPasswordDetail = (val)=>{
       // alert(val);
        $.ajax({
            url:"view_password_detail",
            method:"post",
            data:{id:val},
            contentType:"application/x-www-form-urlencoded",
            success:function(res){
                 $("#password_detl").html(res.pswd);
                 $("#category_detl").html(res.catg_name);
            },
            error: function(err){
              console.log(err);                
            }
        });
    }
});