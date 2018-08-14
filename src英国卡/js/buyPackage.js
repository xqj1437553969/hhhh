import '../css/buyPackage.css';
$(function() {
    FastClick.attach(document.body);
     pushHistory();//解决iphone刷新问题
});
function pushHistory() {
    window.addEventListener("popstate", function(e) {
        self.location.reload();
    }, false);
    var state = {
        title : "",
        url : "#"
    };
    window.history.replaceState(state, "", "#");
};
$("#loadingToast").fadeIn(100);
$('body').height($('body')[0].clientHeight);//弹出键盘错位问题
function getQueryString(str) {
	var reg = new RegExp("(^|&)" + str + "=([^&]*)(&|$)", "i");
	var r = window.location.search.substr(1).match(reg);
	if (r != null)
		return unescape(r[2]);
	return null;
}
var code = getQueryString("code");
var packageId = null;
var productId = null;
var orderSymbol = null;//货币符号
var excRate = null;//汇率
var openId = null;
var nickname = null;
var headurl = null;
var cardId = null;
var activateDateEarliest = null;
var activateDatePrompt = null;
var codeTrue = false;
var hascap = false;
buyPackage();
function buyPackage(){
	  $.ajax({
		  type:"post",
		  url:"../center/buyPackage",
		  data:{
		  	 orderSource:0,
		     code:code
		   },
		   success:function(result){
			   dealResult(result)
		   }
	   });
}
function dealResult(r){
    if(r.success){
		   $("#loadingToast").fadeOut(100);
		   openId = r.data.openId;
		   nickname = r.data.nickname;
		   headurl = r.data.headurl;
		   sessionStorage.setItem("openId",openId);
		   sessionStorage.setItem("nickname",nickname);
		   sessionStorage.setItem("headurl",headurl);
		   sendCount(openId);
		   var operatorList = r.data.operatorList;
		   var index = null;
		   for(var j=0;j<operatorList.length;j++){
		    	if(operatorList[j].countryName=="英国"&&operatorList[j].operatorName.indexOf("gaff")!=-1){
		    		index = j;
		    	}
		   }
		   var uk = operatorList[index];
		   var activateImgUrl = uk.activateImgUrl;
		   $("#card-img").html(`<img src='${activateImgUrl}'/>`)
		   activateDateEarliest = uk.activateDateEarliest;
		   activateDatePrompt = uk.activateDatePrompt;
		   $(".container").show();
		   $("#activate-code").val("");
		   if(r.data.phone){
		   	  var loginPhone = r.data.phone;
		   	  loginPhone = loginPhone.replace("86","");
		   	  $("#phone").attr("disabled","disabled");
		   	  $("#phone").val(loginPhone);
		   	  hascap = false;
		   }else{
		   	  $("#phone").val("");
		   }
	}else if(r.code==2){
		$("#loadingToast").fadeOut(100);
		window.location.href = r.desc;
	}else{
	    window.location.href = "not-exist.html";
	}
}
function sendCount(openId){
	$.ajax({
		type:"post",
		url:"../ctrip/uploadVisitInfo",
		data:{
			addressId:5,
			openId:openId
		},
		success:function(r){
			
		}
	});
}
$("#activate-code").blur(function(){//验证激活码
	var activateCode = $(this).val();
	checkCardNo(activateCode);
})
function checkCardNo(activateCode){//验证激活码
	$(".form").css("borderColor","transparent");
	$("#code-form").css("borderColor","transparent");
	if(!activateCode){
		$("#write-tip").html("激活码不能为空");
		$("#write-tip").css("color","red");
		$("#activate-code").parent().parent().css({"borderColor":"red"});
		clearPackage()
		return;
	}
	var reg = /^[0-9A-Z]{6}$/;
	if(!reg.test(activateCode)){
		$("#write-tip").html("激活码格式不正确");
		$("#write-tip").css("color","red");
		$("#activate-code").parent().parent().css({"borderColor":"red"});
		clearPackage()
		return;
	}
	$(".weui-toast__content").html("激活码验证中");
	$("#loadingToast").fadeIn(100);
	$.ajax({
		type:"post",
		url:"../center/checkCardNo",
		data:{
		   cardNo:activateCode
		},
		success:function(r){
            $("#loadingToast").hide();
            $(".weui-toast__content").html("数据加载中");
			if(r.success){
			  cardId = r.data.cardId;
			  $("#activate-code").parent().parent().css({"borderColor":"transparent"});
			  $("#write-tip").html("资料填写");
			  $("#write-tip").css("color","#fff");
			  var txt = `<div class="package-wrapper">	    		
		    		<div class="select-package">请选择套餐</div>
		    		<ul id="list"></ul>
		    		<div class="package-detail-title">套餐详情</div>
		    		<div class="package-detail"></div>
		    		<div class="select-recharge-title">请选择充值金额</div>
		    		<ul class="select-recharge-list">
					</ul>
					<div class="buy-info">
						<p class="buy-total"></p>
					</div>
				</div>`
			  $(".package-container").html(txt);
			  putData(r.data.packageList);
			  orderSymbol = r.data.currencySymbol;//货币符号
			  excRate = r.data.exchangeRate;//汇率
			  $("#btn-pay").css("marginTop","0.25rem");
			  $(".container").append("<div id='box'></div>");
			  $("#box").css("height","0.6rem");
			  $("#date").html('请选择激活日期（'+activateDatePrompt+'）')
			  codeTrue = true;
			}else{
			  codeTrue = false;
			  var desc = r.desc;
			  if(desc.indexOf("无效")!=-1){
			  	 desc = "无效的激活码";
			  }
			  $("#write-tip").html(desc);
			  $("#write-tip").css("color","red");
			  $("#activate-code").parent().parent().css({"borderColor":"red"});
			  clearPackage()
			}
		}
	});
}
function clearPackage(){
  currencySymbol = null;
  exchangeRate = null;
  packageId = null;
  productId = null;
  codeTrue = false;
  $(".package-container").html("");
  $("#btn-pay").css("marginTop","1.45rem");
  $("#box").remove();
  $("#code-form").css("borderColor","transparent");
  $("#date").html('请选择激活日期')
}
function putData(packageList){
	packageId = null;
	productId = null;
	var packageList = packageList;
	var length = packageList.length;
	var str = "";
	for(var i=0;i<length;i++){
		var packageName = packageList[i].packageName.replace(" ","");
		str+=`<li data-id="${packageList[i].packageId}">${packageName}</li>`
	}
	$("#list").html(str);
	$("#list>li").eq(0).addClass("checked");
	var one = packageList[0].packageDesc.replace(/<[^>]*>/g,"，");
	$(".package-detail").html(one);
	packageId = Number($("#list>li").eq(0).attr("data-id"));
	getProductList(packageList,0);
	$("#list>li").click(function(){
		$(".buy-total").html("");
		productId = null;
		if($(this).hasClass("checked")){
			return;
		}
		$(this).addClass("checked").siblings().removeClass("checked");
        var index = $(this).index();
        var two = packageList[index].packageDesc.replace(/<[^>]*>/g,"，");
        $(".package-detail").html(two);
		packageId = Number($(this).attr("data-id"));
		getProductList(packageList,index);
    })
}
function getProductList(packageList,index){
       var productLists = packageList[index].productList;
       var str = '';
       for(var i=0;i<productLists.length;i++){
       	  var productName = productLists[i].productName;
		  var _productId = productLists[i].productId;
		  var productPrice =productLists[i].productPrice;
       	  str+='<li  data-productprice="'+productPrice+'" data-productid="'+_productId+'">'+productName+'</li>'
       }
       $(".select-recharge-list").html(str);//插入产品列表
	   $(".select-recharge-list>li").click(function(){
	   	  $(this).addClass("checked").siblings().removeClass("checked");
	   	   moneyCount();
	   })
}

function moneyCount(){
	 var ele = $(".select-recharge-list>li[class='checked']");
	 var _productprice = ele.attr("data-productprice");
	 productId = ele.attr("data-productid");
	 var symt = orderSymbol +_productprice;
	 var rmb = _productprice*excRate;
    $(".buy-total").html('总计:'+symt+'=<strong>'+rmb.toFixed(2)+'CNY</strong>');
}

$("#phone").blur(function(){//验证手机号
	var phoneNum = $(this).val();
	checkPhone(phoneNum);
})
function checkPhone(phoneNum){
	$(".form").css("borderColor","transparent");
	$("#code-form").css("borderColor","transparent");
	if(!phoneNum){
		$("#write-tip").html("手机号不能为空");
		$("#write-tip").css("color","red");
		$("#phone").parent().parent().css({"borderColor":"red"});
		$(".code-container").html("");
		return;
	}
	var reg = /^[1][3,4,5,7,8,9][0-9]{9}$/;
	if(!reg.test(phoneNum)){
		$("#write-tip").html("手机号格式不正确");
		$("#write-tip").css("color","red");
		$("#phone").parent().parent().css({"borderColor":"red"});
		$(".code-container").html("");
		return;
	}
	$(".weui-toast__content").html("手机号验证中");
	$("#loadingToast").fadeIn(100);
	$.ajax({
		type:"post",
		url:"../center/checkPhone",
		data:{
		   phone:"86"+phoneNum
		},
		success:function(r){
//			console.log(r)
			$("#loadingToast").hide();
			$(".weui-toast__content").html("数据加载中");
			if(r.success){//该手机已领卡
			   hascap = false;
			   $(".code-container").html("");
			   $("#write-tip").html("资料填写");
			   $("#write-tip").css("color","#fff");
			   $("#phone").parent().parent().css({"borderColor":"transparent"});		   
			}else{//该手机未领卡需要发送验证码
			   hascap = true;
			   var codetxt = `<div class="code-form" id="code-form">
			    	<div class="form">
			    		<div class="cell"><label class="label">验证码</label></div>
			            <div class="cell-input">
			                 <input type="text" id="code" placeholder="请输入验证码">
			            </div>
			    	</div>
			    	<button id="get-code">获取验证码</button>
		    	</div>`
		       $(".code-container").html(codetxt);
		       $("#write-tip").html("资料填写");
			   $("#write-tip").css("color","#fff");
			   $("#phone").parent().parent().css({"borderColor":"transparent"});
			}
		}
	});
}
var timer = null;
var count = 60;
$(".code-container").on("click","#get-code",function(){//验证码发送
	$(".form").css("borderColor","transparent");
	$("#code-form").css("borderColor","transparent");
	var phoneNum = $("#phone").val();
	if(!phoneNum){
		$("#write-tip").html("手机号不能为空");
		$("#write-tip").css("color","red");
		$("#phone").parent().parent().css({"borderColor":"red"})
		return;
	}
	var reg = /^[1][3,4,5,7,8,9][0-9]{9}$/;
	if(!reg.test(phoneNum)){
		$("#write-tip").html("手机号格式不正确")
		$("#write-tip").css("color","red");
		$("#phone").parent().parent().css({"borderColor":"red"})
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
    		   $("#write-tip").css("color","red");
		       $("#write-tip").html(r.desc);
    		}
    	}
    	
    });
	
})


$("#date-warpper").click(function(){//激活日期选择
    if(codeTrue){
    	var firstDay = getDate(activateDateEarliest);
    	weui.datePicker({
    		start : firstDay, // 从今天开始
    		end : 2030,
    		defaultValue : [ firstDay.getFullYear(), firstDay.getMonth() + 1, firstDay.getDate() ],
    		onConfirm : function(result) {
    			var x = result[0].value + "-" + (result[1].value < 10 ? ('0' + result[1].value) : result[1].value) + "-" + (result[2].value < 10 ? ('0' + result[2].value) : result[2].value);
    			$("#date").html(x);
    			$("#date").css({"color":"#000","fontFamily":"微软雅黑"});
    		},
    		id : 'datePicker'
    	});
    }
})

var canPay = true;
$("#btn-pay").on('touchstart',function(){
	$(this).css('backgroundColor','#a23872');
})
$("#btn-pay").on('touchend',function(){
	$(this).css('backgroundColor','#ca1d7b');
})
$("#btn-pay").click(function(){//创建订单
	$("#write-tip").html("资料填写");
	$("#write-tip").css("color","#fff");
	$(".form").css("borderColor","transparent");
	$("#code-form").css("borderColor","transparent");
    var activateCode = $("#activate-code").val(); 
	var phone = $("#phone").val();
	var activateDate = $("#date").html();
	if(!activateCode){
		$("#write-tip").html("激活码不能为空");
		$("#write-tip").css("color","red");
		$("#activate-code").parent().parent().css({"borderColor":"red"});
		clearPackage();
		$("body").scrollTop(0);
		return;
	}
	var reg = /^[0-9A-Z]{6}$/;
	if(!reg.test(activateCode)){
		$("#write-tip").html("激活码格式不正确");
		$("#write-tip").css("color","red");
		$("#activate-code").parent().parent().css({"borderColor":"red"});
		clearPackage();
		$("body").scrollTop(0);
		return;
	}
	if(!codeTrue){//激活码验证未通过
	    $("#write-tip").html("无效的激活码");
		$("#write-tip").css("color","red");
		$("#activate-code").parent().parent().css({"borderColor":"red"})
		$("body").scrollTop(0);
		return;
	}
	if(!phone){//手机号不能为空
		$("#write-tip").html("手机号不能为空");
		$("#write-tip").css("color","red");
		$("#phone").parent().parent().css({"borderColor":"red"})
		$("body").scrollTop(0);
		return;
	}
	var regphone = /^[1][3,4,5,7,8,9][0-9]{9}$/;
	if(!regphone.test(phone)){
		$("#write-tip").html("手机号格式不正确");
		$("#write-tip").css("color","red");
		$("#phone").parent().parent().css({"borderColor":"red"});
		$("body").scrollTop(0);
		return;
	}
	if(hascap){//验证码不能为空
		if(!$("#code").val()){
			$("#write-tip").html("验证码不能为空");
			$("#write-tip").css("color","red");
			$("#code-form").css({"borderColor":"red"})
			$("body").scrollTop(0);
			return;
	    }
		var regcode =/^\d{6}$/;
		if(!regcode.test($("#code").val())){
			$("#write-tip").html("验证码格式错误");
			$("#write-tip").css("color","red");
			$("#code-form").css({"borderColor":"red"})
			$("body").scrollTop(0);
			return;
		}
    }
	if(activateDate.indexOf("请选择激活日期")!=-1){//激活日期不能为空
		$("#write-tip").html("请选择激活日期");
		$("#write-tip").css("color","red");
		$("#date-warpper").css({"borderColor":"red"})
		$("body").scrollTop(0);
		return;
	}
	if(!productId){
	    $("#write-tip").html("请选择充值金额");
		$("#write-tip").css("color","red");
		$("body").scrollTop(0);
		return;
	}
	if(!hascap){
		productId = Number(productId);
		var data = {
			openId:openId,
			nickname:nickname,
			headurl:headurl,
			productId:productId,
			packageId:packageId,
			cardId:cardId,
			activateDate:activateDate,
			phone:"86"+phone,
			orderSource:0
		}
	}else{
		var captcha = $("#code").val();
		var data = {
			openId:openId,
			nickname:nickname,
			headurl:headurl,
			productId:productId,
			packageId:packageId,
			cardId:cardId,
			activateDate:activateDate,
			phone:"86"+phone,
			captcha:captcha,
			orderSource:0
		}
	}
  if(canPay){
  	  canPay = false;
	  $("#loadingToast").fadeIn(100);
  	  $.ajax({
		type:"post",
		url:"../center/placeOrder",
		data:data,
		success:function(r){
            $("#loadingToast").hide();
			if(r.success){
				pay(r);
			}else{
                var desc = r.desc;
                if(desc.indexOf("验证码错误")!=-1){
                	$("#write-tip").html("验证码错误");
					$("#write-tip").css("color","red");
					$(".code-form").css({"borderColor":"red"});
					$("body").scrollTop(0);
                }else{
                	$("#write-tip").html(desc);
					$("#write-tip").css("color","red");
					$("body").scrollTop(0);
                }
                canPay = true;  
			}
		}
	});
  }
})

function pay(r){
	function onBridgeReady(){
	   console.log(r);
	   WeixinJSBridge.invoke(
	       'getBrandWCPayRequest', {
	           "appId":r.data.appId,     //公众号名称，由商户传入     
	           "timeStamp":r.data.timeStamp,         //时间戳，自1970年以来的秒数     
	           "nonceStr":r.data.nonceStr, //随机串     
	           "package":r.data.packageStr,     
	           "signType":r.data.signType, //微信签名方式：     
	           "paySign":r.data.paySign//微信签名 
	       },
	       function(res){
	           if(res.err_msg == "get_brand_wcpay_request:ok" ) {
	           	   canPay = true;
	           	   location.href="paySuccess.html";
	           }else{
	               canPay = true;
	           	   location.href="payFailed.html";
	           }
	       }
	   ); 
	}
	if (typeof WeixinJSBridge == "undefined"){
	   if( document.addEventListener ){
	       document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
	   }else if (document.attachEvent){
	       document.attachEvent('WeixinJSBridgeReady', onBridgeReady); 
	       document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
	   }
	}else{
	   onBridgeReady();
	}
}
$("#know").click(function(){//点击知道了消息通知层消失
	$("#message-tell").fadeOut(200);
})