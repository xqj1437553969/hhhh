import '../css/login.css';
$('body').height($('body')[0].clientHeight);//弹出键盘错位问题
$("#lable").click(function(){
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
		 }
], {
   className: 'custom-classname',
   defaultValue: [0, 1],
   onChange: function (result) {
       console.log(result)
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
$("#get-code").click(function(){//验证码请求
	var reg = {
		'cn':/^[1][3,4,5,7,8,9][0-9]{9}$/,
		'gb':/^0?7[0-9]{9}$/
	};
	var phoneNum = $("#phone").val();
	var that = this;
	if($("#lable").html().indexOf("86")!=-1){
		var areaNum = "86";
		if(!reg.cn.test(phoneNum)){
			$("#tip-info").html("手机号格式不正确");
	        $("#iosDialog2").fadeIn(200);
	        return;
		}
	}else if($("#lable").html().indexOf("44")!=-1){
		var areaNum = "44";
		if(!reg.gb.test(phoneNum)){
			$("#tip-info").html("手机号格式不正确");
	        $("#iosDialog2").fadeIn(200);
	        return;
		}
	}
//	console.log(areaNum);
	if(phoneNum.indexOf("0")==0){
		phoneNum = phoneNum.replace("0","");
	}
	var phone = areaNum + phoneNum;
//	console.log(phone);
    $.ajax({
    	type:"post",
    	url:"../center/captcha",
    	data:{
    		phone:phone
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
	var reg2 = {
		'cn':/^[1][3,4,5,7,8,9][0-9]{9}$/,
		'gb':/^0?7[0-9]{9}$/
	};
	if($("#lable").html().indexOf("86")!=-1){
		var areaNum = "86";
		if(!reg2.cn.test(phoneNum)){
			$("#tip-info").html("手机号格式不正确");
	        $("#iosDialog2").fadeIn(200);
	        return;
		}
	}else if($("#lable").html().indexOf("44")!=-1){
		var areaNum = "44";
		if(!reg2.gb.test(phoneNum)){
			$("#tip-info").html("手机号格式不正确");
	        $("#iosDialog2").fadeIn(200);
	        return;
		}
	}
	console.log(areaNum);
	if(phoneNum.indexOf("0")==0){
		phoneNum = phoneNum.replace("0","");
	}
	var phone = areaNum + phoneNum;
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
		url:"../center/login",
		data:{
			orderSource:0,
			openId:openId,
			nickname:nickname,
			headurl:headurl,
			phone:phone,
			captcha:captcha
		},
		success:function(r){
			$loadingToast.fadeOut(100);
			if(r.success){
				var student = r.data.student
				localStorage.setItem("student",JSON.stringify(student));
				window.location.href = "information.html";
			}else{
			   if(r.desc.indexOf("未注册")!=-1){
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