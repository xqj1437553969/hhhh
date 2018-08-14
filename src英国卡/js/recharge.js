import '../css/recharge.css';
$(function() {
     pushHistory();//解决iphone刷新问题
     FastClick.attach(document.body);
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
function getQueryString(str) {
	var reg = new RegExp("(^|&)" + str + "=([^&]*)(&|$)", "i");
	var r = window.location.search.substr(1).match(reg);
	if (r != null)
		return unescape(r[2]);
	return null;
}
$("#loadingToast").fadeIn(100);
$('body').height($('body')[0].clientHeight);//弹出键盘错位问题
var code = getQueryString("code");
var openId = null;
var operatorId = null;
var orgpackageId = null;
var nowpackageId = null;
var studentId = null;
var packageName = null;
var nowType = null;
var reType = null;
var productId = null;
var orderSymbol = null;
var excRate = null;
var changeLimit = null;
$.ajax({
	type:"post",
	url:"../center/recharge",
	data:{
		code:code
	},
	success:function(r){
		if(r.success){
			$("#loadingToast").fadeOut(100);
			openId = r.data.openId;
			sessionStorage.setItem("openId",openId);
			sendCount(openId);
			$(".container").show();
			$("#phone").val("");
		}else if(r.code==2){
			$("#loadingToast").fadeOut(100);
			window.location.href = r.desc;
		}else{
			window.location.href = "not-exist.html";
		}
	}
});
function sendCount(openId){
	$.ajax({
		type:"post",
		url:"../ctrip/uploadVisitInfo",
		data:{
			addressId:10,
			openId:openId
		},
		success:function(r){
			
		}
	});
}
var phoneTrue = false;
$("#phone").focus(function(){
	phoneTrue = false;
})
$("#phone").blur(function(){
	productId = null;
	var phone = $("#phone").val();
	if(!phone){
	   $(".write-tip").html("号码不能为空");
	   $(".write-tip").css("color","red");
	   return;
	}
	if(phone.indexOf("0")==0){
	   phone = phone.replace("0","");
	}
	$(".weui-toast__content").html("号码检测中");
	$("#loadingToast").fadeIn(100);
	$.ajax({
		type:"post",
		url:"../center/getPackageByPhone",
		data:{
		   phoneNo:"44"+phone
		},
		success:function(r){
			$("#loadingToast").hide();
			$(".weui-toast__content").html("数据加载中");
			if(r.success){
				phoneTrue = true;
				studentId = r.data.studentId;
				changeLimit = r.data.changeLimit;
				$(".write-tip").html("请填写国外号码");
				$(".write-tip").css("color","#fff");
				dealResult(r.data)
			}else{
				changeLimit = null;
				phoneTrue = false;
				$(".write-tip").html(r.desc);
				$(".write-tip").css("color","red");
				$(".recharge-wrapper").html("");
			    $("#btn-pay").css("marginTop","2.45rem");
			}
		}
	});
})
function dealResult(res){
    $(".recharge-wrapper").html(`<div class="change-wrapper">
		    		<span>当前套餐</span><span id="package-name"></span>
		        </div>
		        <div class="recharge-type">
		        	<div class="type-tip">充值类型</div>
		        	<div class="btns">
		        		<button id="original-btn">原套餐充值</button>
		    			<button id="only-btn">仅充值</button>
		    			<button id="change-btn">变更套餐充值</button>
		        	</div>
		        	<div class="desc-tip">类型说明</div>
		        	<div class="type-desc">充值后用于继续购买当前套餐</div>
		        </div>
		    	<div class="package-wrapper">
		    	</div>
		    	<div class="product-wrapper">
					<div class="select-recharge-title">请选择充值金额</div>
		    		<ul class="select-recharge-list">
					</ul>
					<div class="buy-info">
						<p class="buy-total"></p>
			        </div>
			   </div>`)
    $("#package-name").text(res.packageName);
    putProductList(res.productList);
    operatorId = res.operatorId;
    orgpackageId = res.packageId;
    orderSymbol = res.currencySymbol;
	excRate = res.exchangeRate;
}
$(".recharge-wrapper").on("click","#original-btn",function(){
	$(".write-tip").html("请填写国外号码");
	$(".write-tip").css("color","#fff");
	$(this).addClass("checked").siblings().removeClass("checked");
	$(".package-wrapper").html('');
	$(".package-wrapper").css("paddingBottom","0");
	$(".type-desc").text("充值后用于继续购买当前套餐");
	$(".desc-tip").show();
	$(".type-desc").show();
	reType = 0;
	getList(reType)
})
$(".recharge-wrapper").on("click","#only-btn",function(){
	$(".write-tip").html("请填写国外号码");
	$(".write-tip").css("color","#fff");
	$(this).addClass("checked").siblings().removeClass("checked");
	$(".package-wrapper").html('');
	$(".package-wrapper").css("paddingBottom","0");
	$(".type-desc").text("仅话费充值，不购买套餐");
	$(".desc-tip").show();
	$(".type-desc").show();
	reType = 1;
	getList(reType);
})
$(".recharge-wrapper").on("click","#change-btn",function(){
	if(changeLimit==false){
		$(".write-tip").html("请填写国外号码");
		$(".write-tip").css("color","#fff");
		$(".desc-tip").hide();
		$(".type-desc").hide();
	    $(this).addClass("checked").siblings().removeClass("checked");
	    if(nowType!=2){
	    	  $(".package-wrapper").html(`<div class="select-package">请选择套餐</div>
			    	    <ul id="list"></ul>
			    	    <div class="package-detail-title">套餐详情</div>
			    		<div class="package-detail"></div>`);
	    }
	    reType = 2;
		getList(reType);
	}else if(changeLimit==true){
	     $(".write-tip").html("您有订单处理中，请勿重复操作");
		 $(".write-tip").css("color","red");
	}
	
})
function getList(rechargeType){
	if(nowType===rechargeType){
	    
	}else{
		nowType=rechargeType
		$("#loadingToast").fadeIn(100);
		$.ajax({
			type:"post",
			url:"../center/packageInfo",
			data:{
			  operatorId:operatorId,
			  packageId:orgpackageId,
			  rechargeType:rechargeType
			},
			success:function(r){
				if(r.success){					
					if(rechargeType===0||rechargeType===1){
						putProductList(r.data.productList)
						$("#loadingToast").hide();
					}else if(rechargeType===2){
						putPackageList(r.data.packageList)
						$("#loadingToast").hide();
						$(".package-wrapper").show();
		                $(".package-wrapper").css("paddingBottom","0.17rem");
					}
				}
			}
		});
	}
}
function putPackageList(packageList){
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
	nowpackageId = Number($("#list>li").eq(0).attr("data-id"));
	putProductList(packageList[0].productList);
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
		nowpackageId = Number($(this).attr("data-id"));
		putProductList(packageList[index].productList);
    })
}
function putProductList(productList){
	productId = null;
    var str = '';
   	for(var i=0;i<productList.length;i++){
	   	  var productName = productList[i].productName;
		  var _productId = productList[i].productId;
		  var productPrice =productList[i].productPrice;
	   	  str+='<li  data-productprice="'+productPrice+'" data-productid="'+_productId+'">'+productName+'</li>'
    }
    $(".select-recharge-list").html(str);
    $(".select-recharge-list>li").click(function(){
    	   $(".write-tip").html("请填写国外号码");
		   $(".write-tip").css("color","#fff");
	   	   $(this).addClass("checked").siblings().removeClass("checked");
	   	   moneyCount();
    })
    $("#btn-pay").css("marginTop","0.25rem");
}
function moneyCount(){
	 var ele = $(".select-recharge-list>li[class='checked']");
	 var _productprice = ele.attr("data-productprice");
	 productId = ele.attr("data-productid");
	 var symt = orderSymbol + _productprice;
	 var rmb = _productprice*excRate;
    $(".buy-total").html('总计:'+symt+'=<strong>'+rmb.toFixed(2)+'CNY</strong>');
}
var canPay = true;
$("#btn-pay").on('touchstart',function(){
	$(this).css('backgroundColor','#a23872');
})
$("#btn-pay").on('touchend',function(){
	$(this).css('backgroundColor','#ca1d7b');
})
$("#btn-pay").click(function(){
	 if(!$("#phone").val()){
	 	$(".write-tip").html("号码不能为空");
		$(".write-tip").css("color","red");
		$(".recharge-wrapper").html("");
	    $("#btn-pay").css("marginTop","2.45rem");
	    $("body").scrollTop(0);
		return;
	 }
	 if(!phoneTrue){
	 	$(".write-tip").html("号码不存在");
		$(".write-tip").css("color","red");
		$(".recharge-wrapper").html("");
	    $("#btn-pay").css("marginTop","2.45rem");
	    $("body").scrollTop(0);
		return;
	 }
	 if(reType===null){
	 	$(".write-tip").html("请选择充值类型");
		$(".write-tip").css("color","red");
		$("body").scrollTop(0);
		return;
	 }
	 if(productId===null){
	 	$(".write-tip").html("请选择充值金额");
		$(".write-tip").css("color","red");
		$("body").scrollTop(0);
		return;
	 }
	 var phoneNo = $("#phone").val();
	 if(phoneNo.indexOf("0")==0){
		phoneNo = phoneNo.replace("0","");
	 }
	 if(reType===0||reType===1){
	 	var sendData = {
	 		 studentId:studentId,
	 		 phoneNo:"44"+phoneNo,
	 		 packageId:orgpackageId,
	 		 rechargeType:reType,
	 		 productId:productId,
	 		 orderSource:0,
	 		 openId:openId
	 	}
	 }else{
	    var sendData = {
	 		 studentId:studentId,
	 		 phoneNo:"44"+phoneNo,
	 		 packageId:nowpackageId,
	 		 rechargeType:reType,
	 		 productId:productId,
	 		 orderSource:0,
	 		 openId:openId
	 	}
	 }
	 if(canPay){
	 	canPay = false;
	 	$("#loadingToast").fadeIn(100);
	 	$.ajax({
	 		type:"post",
	 		url:"../center/rechargeOrder",
	 		data:sendData,
	 		success:function(r){
	 			$("#loadingToast").hide();
	 			if(r.success){
	 				pay(r);
	 			}else{
	 				$(".write-tip").html(r.desc);
					$(".write-tip").css("color","red");
					$("body").scrollTop(0);
					canPay = true;
	 			}
	 		}
	 	});
	 }
})

function pay(r){
	function onBridgeReady(){
	   WeixinJSBridge.invoke(
	       'getBrandWCPayRequest', {
	           "appId":r.data.appId,       
	           "timeStamp":r.data.timeStamp,    
	           "nonceStr":r.data.nonceStr,    
	           "package":r.data.packageStr,     
	           "signType":r.data.signType,    
	           "paySign":r.data.paySign
	       },
	       function(res){
	           if(res.err_msg == "get_brand_wcpay_request:ok" ) {
	           	   canPay = true;
	           	   location.href="prepaidSuccess.html";
	           }else{
	               canPay = true;
	           	   location.href="prepaidFailed.html";
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
