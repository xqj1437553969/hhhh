import '../css/getCard.css';
$('body').height($('body')[0].clientHeight);//弹出键盘错位问题
var openId = sessionStorage.getItem("openId");
if(openId){	
	$.ajax({
		type:"post",
		url:"../ctrip/uploadVisitInfo",
		data:{
			addressId:8,
			openId:openId
		},
		success:function(r){
		
		}
	});
}
var timer = null;
var count = 60;
$("#get-code").click(function(){//验证码请求
	var reg = /^[1][3,4,5,7,8,9][0-9]{9}$/;
	var phoneNum = $("#phone").val();
	if(!reg.test(phoneNum)){
		$("#tip-info").html("手机号格式不正确");
	    $("#iosDialog2").fadeIn(200);
		return;
	}
	var phone = "86"+ phoneNum;
	var  that = this;
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


function selectArea(){//地区选择
	 var area1 = new LArea();
	 area1.init({
		'trigger' : '#select-area', //触发选择控件的文本框，同时选择完毕后name属性输出到该位置
		'valueTo' : '#value1', //选择完毕后id属性输出到该位置
		'keys' : {id : 'id',name : 'name'}, //绑定数据源相关字段 id对应valueTo的value属性输出 name对应trigger的value属性输出
		'type' : 1, //数据源类型
		'data' : LAreaData//数据源
     });
	 area1.value = [1,13,1];//控制初始位置，注意：该方法并不会影响到input的value
}
selectArea();

$("#btn-sub").on('touchstart',function(){
	$(this).css('backgroundColor','#a23872');
})
$("#btn-sub").on('touchend',function(){
	$(this).css('backgroundColor','#ca1d7b');
})
$("#btn-sub").on("click",btnSub);
function btnSub(){
	var nickname = sessionStorage.getItem("nickname");
	var headurl  = sessionStorage.getItem("headurl");
	var typeInfo = sessionStorage.getItem("type");
	var sceneId = sessionStorage.getItem("sceneId");
	if(typeInfo){		
	   typeInfo = Number(typeInfo);
	}
	var username = $("#username").val();
	var phoneNum = $("#phone").val();
	var code = Number($("#code").val());
	var selectArea = $("#select-area").val();
	var address = $("#address").val();
	if(!(username&&phoneNum&&code&&selectArea&&address)){
		$("#tip-info").html("请全部填写后再提交");
	    $("#iosDialog2").fadeIn(200);
		return;
	}
	var sendAddress = selectArea + address;
	var operatorId = sessionStorage.getItem("operatorId");
	operatorId = Number(operatorId);
	var $loadingToast = $("#loadingToast")
	$loadingToast.show();
	$.ajax({
		type:"post",
		url:"../center/cardOrder",
		data:{
			openId:openId,
			nickname:nickname,
			headurl:headurl,
			agentId:typeInfo||null,
			sceneId:sceneId||null,
			operatorId:operatorId,
			orderSource:0,
			orderName:username,
			orderPhone:"86"+phoneNum,
			captcha:code,
			orderAddress:sendAddress
		},
		success:function(r){
			$loadingToast.hide();
			if(r.success){
				window.location.href = "cardSuccess.html"
			}else{
				$("#tip-info").html(r.desc);
			    $("#iosDialog2").fadeIn(200);
			}
		}
	});
}
$("#know").click(function(){
	$("#iosDialog2").fadeOut(200);
})