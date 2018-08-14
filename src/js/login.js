import '../css/login.css';
$('body').height($('body')[0].clientHeight);//弹出键盘错位问题
$("#lable").click(function(){//weui级联，用于号码区号选择
	weui.picker([
		{
		    label: '中国',
		    value: 0,
		    children: [
		        {
		            label: '+86',
		            value: 1
		        }
		    ]
		},
		{
		    label: '英国',
		    value: 1,
		    children: [
		        {
		            label: '+44',
		            value: 1
		        }
		    ]
		},
		{
		    label: '美国',
		    value: 2,
		    children: [
		        {
		            label: '+1',
		            value: 1
		        }
		    ]
		}
], {
   className: 'custom-classname',
   defaultValue: [0, 1],
   onChange: function (result) {
   	
   },
   onConfirm: function (result) {
   	  var x = result[0].label +"（"+result[1].label+"）"
      $("#lable>span").text(x);
   },
   id: 'doubleLinePicker'
});
})
var timer = null;
var count = 60;
var reg = {
	//手机号验证正则
	"cn":/^[1][3,4,5,7,8,9][0-9]{9}$/,
	"gb":/^0?7[0-9]{9}$/,
	"us":/^[0-9]{10}$/
};
$("#get-code").click(function(){//发送验证码
	var phone = $("#phone").val();
	var that = this;
	if($("#lable").html().indexOf("86")!=-1){
		//区号为86时验证相应的手机号正则
		var areaNum = "86";
		if(!reg.cn.test(phone)){
			$("#tip-info").html("手机号格式不正确");
	        $("#iosDialog2").fadeIn(200);
	        return;
		}
	}else if($("#lable").html().indexOf("44")!=-1){
		//区号为44时验证相应的手机号正则
		var areaNum = "44";
		if(!reg.gb.test(phone)){
			$("#tip-info").html("手机号格式不正确");
	        $("#iosDialog2").fadeIn(200);
	        return;
		}
		if(phone.indexOf("0")==0){
			//用户输入的英国手机号开头为0默认去除
		    phone = phone.replace("0","");
		}
	}else{
		//区号为1时验证相应的手机号正则
		var areaNum = "1";
		if(!reg.us.test(phone)){
			$("#tip-info").html("手机号格式不正确");
	        $("#iosDialog2").fadeIn(200);
	        return;
		}
	}
    $.ajax({
    	//手机验证码请求
    	type:"post",
    	url:"../center/captcha",
    	data:{
    		phone:areaNum + phone
    	},
    	success:function(r){
    		if(r.success){
    			timer = setInterval(function(){
                    //验证码倒计时
    				$(that).attr("disabled", "true");//发送验证码按钮设置为不可点击 
    				count--;
					if(count==0){
					   $(that).removeAttr("disabled"); 
					   clearInterval(timer);
					   count = 60;
					   $(that).html("请重新获取")
					   return;
					}
					$(that).html("已发送<span>"+count+"s</span>");
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
	//登录按钮点击
	var phone = $("#phone").val();//手机号
	var captcha = $("#captcha").val();//验证码
	var $loadingToast = $("#loadingToast");
	if($("#lable").html().indexOf("86")!=-1){
		//区号为86时验证相应的手机号正则
		var areaNum = "86";
		if(!reg.cn.test(phone)){
			$("#tip-info").html("手机号格式不正确");
	        $("#iosDialog2").fadeIn(200);
	        return;
		}
	}else if($("#lable").html().indexOf("44")!=-1){
		//区号为44时验证相应的手机号正则
		var areaNum = "44";
		if(!reg.gb.test(phone)){
			$("#tip-info").html("手机号格式不正确");
	        $("#iosDialog2").fadeIn(200);
	        return;
		}
		if(phone.indexOf("0")==0){
			phone = phone.replace("0","");
		}
	}else{
		//区号为1时验证相应的手机号正则
		var areaNum = "1";
		if(!reg.us.test(phone)){
			$("#tip-info").html("手机号格式不正确");
	        $("#iosDialog2").fadeIn(200);
	        return;
		}
	}
	if(!captcha){
		//登录时验证码不能为空
		$("#tip-info").html("请填写验证码");
	    $("#iosDialog2").fadeIn(200);
	    return;
	}
	var openId = sessionStorage.getItem("openId");//微信openId
	var nickname = sessionStorage.getItem("nickname");//微信昵称
	var headurl = sessionStorage.getItem("headurl");//微信头像url
	$loadingToast.fadeIn(100);
	$.ajax({
		type:"post",
		url:"../center/login",
		data:{
			orderSource:0,
			openId:openId,
			nickname:nickname,
			headurl:headurl,
			phone:areaNum+phone,
			captcha:captcha
		},
		success:function(r){
			$loadingToast.fadeOut(100);
			if(r.success){
				var student = r.data.student;//用户信息
				localStorage.setItem("student",JSON.stringify(student));
				window.location.href = "information.html";
			}else{
			   if(r.desc.indexOf("未注册")!=-1){
			   	   //弹出框提示未注册，弹出框底部附带立即注册跳转链接
			   	   $("#popup-info").html(r.desc);
			   	   $("#login-popup").fadeIn(100);
			   }else{			   	
			   	   $("#tip-info").html(r.desc);
			   	   $("#iosDialog2").fadeIn(100);
			   }
			}
		}
	});
})

$("#know").click(function(){
	$("#iosDialog2").fadeOut(100);
})