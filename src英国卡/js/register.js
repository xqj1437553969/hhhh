import '../css/register.css';
$('body').height($('body')[0].clientHeight);//弹出键盘错位问题
var timer = null;
var count = 60;
var reg = /^[1][3,4,5,7,8,9][0-9]{9}$/;
$("#get-code").click(function(){//验证码请求
	var phoneNum = $("#phone").val();
	if(!reg.test(phoneNum)){
		$("#tip-info").html("手机号格式不正确");
        $("#iosDialog2").fadeIn(200);
        return;
	}
	var that = this;
    $.ajax({
    	type:"post",
    	url:"../center/captcha",
    	data:{
    		phone:"86"+phoneNum
    	},
    	success:function(r){
    		if(r.success){
    			timer = setInterval(function(){
				$(that).html("已发送<span>"+count+"s</span>");
				if(count==0){
				   $(that).removeAttr("disabled"); 
				   clearInterval(timer);
				   count = 60;
				   $(that).html("请重新获取")
				   return;
				}
				$(that).attr("disabled", "true"); 
				   count--
				},1000)
    		}else{
    			$("#tip-info").html(r.desc);
	    		$("#iosDialog2").fadeIn(200);
    		}
    	}
    	
    });
})
$("#btn-login").on('touchstart',function(){
	$(this).css("backgroundColor","#a23872");
})
$("#btn-login").on('touchend',function(){
	$(this).css("backgroundColor","#ca1d7b");
})
$("#btn-login").click(function(){
	var phoneNum = $("#phone").val();
	var captcha = $("#captcha").val();
	var $loadingToast = $("#loadingToast")
	if(!reg.test(phoneNum)){
		$("#tip-info").html("手机号格式不正确");
        $("#iosDialog2").fadeIn(200);
        return;
	}
	if(!captcha){
		$("#tip-info").html("请填写验证码");
	    $("#iosDialog2").fadeIn(200);
	    return;
	}
	var openId = sessionStorage.getItem("openId");
	var nickname = sessionStorage.getItem("nickname");
	var headurl = sessionStorage.getItem("headurl");
	$loadingToast.fadeIn(100);
	$.ajax({
		type:"post",
		url:"../center/register",
		data:{
			orderSource:0,
			openId:openId,
			nickname:nickname,
			headurl:headurl,
			phone:"86"+phoneNum,
			captcha:captcha
		},
		success:function(r){
			$loadingToast.fadeOut(100);
			if(r.success){
				layer.msg("注册成功");
				setTimeout(function(){					
					window.location.href = "information.html";
				},500)
			}else{
			   $("#tip-info").html(r.desc);
	    	   $("#iosDialog2").fadeIn(100);
			}
		}
	});
})

$("#know").click(function(){
	$("#iosDialog2").fadeOut(100);
})