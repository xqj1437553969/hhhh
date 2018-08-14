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
function getQueryString(str) {//截取url
	var reg = new RegExp("(^|&)" + str + "=([^&]*)(&|$)", "i");
	var r = window.location.search.substr(1).match(reg);
	if (r != null)
		return unescape(r[2]);
	return null;
}
$('body').height($('body')[0].clientHeight);//弹出键盘错位问题
$("#lable").click(function(){
	weui.picker([
		{
		    label: '英国',
		    value: 0,
		    children: [
		        {
		            label: '+44',
		            value: 1
		        }
		    ]
		},
		{
		    label: '美国',
		    value: 1,
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
   onChange: function (result){
   	
   },
   onConfirm: function (result) {
   	  var x = result[0].label +"（"+result[1].label+"）";
      $("#lable>span").text(x);
      checkPhone();
   },
   id: 'doubleLinePicker'
});
})
var code = getQueryString("code");
var openId = null;
var reg = {
	 "gb":/^0?7[0-9]{9}$/,
	 "us":/^[0-9]{10}$/
}
var recharge = {
	operatorId:null,//运营商Id
	orgpackageId:null,//手机号的默认套餐Id
	nowpackageId:null,//后台收费模式为产品时变更套餐后的套餐Id
	studentId:null,//用户id
	packageName:null,//手机号的默认套餐名称
	nowType:null,//后台收费模式为产品时点击同一按钮的标识
	reType:null,//后台收费模式为产品时充值类型（0为原套餐充值，1为仅充值，2为变更套餐充值）
	productId:null,//后台收费模式为产品时的产品Id
	currencySymbol:null,//货币符号
	exchangeRate:null,//汇率
	changeLimit:null,//限制变更套餐的标识（true为限制变更套餐，false不限制）
	priceId:null//后台收费模式为月份时的价格Id
}
getRecharge();
function getRecharge(){//微信授权
	$("#loadingToast").fadeIn(100);
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
				sendCount(openId);//访问量请求
				$(".container").show();
			}else if(r.code==2){//页面重定向
				$("#loadingToast").fadeOut(100);
				window.location.href = r.desc;
			}else{//授权失败跳转到相应的提示页面
				window.location.href = "not-exist.html";
			}
		}
	});
}
function sendCount(openId){//页面访问量发送请求
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
function clearRecharge(){//号码填写错误或者验证失败时清除所有的数据
	recharge.operatorId = null;
	recharge.orgpackageId = null;
	recharge.nowpackageId = null;
	recharge.studentId = null;
	recharge.packageName = null;
	recharge.nowType = null;
	recharge.reType = null;
	recharge.currencySymbol = null;
	recharge.exchangeRate = null;
	recharge.changeLimit = null;
	recharge.productList = null;
	recharge.priceList = null;
	recharge.productId = null;
	recharge.priceId = null;
	$(".recharge-wrapper").html("");//清空页面渲染的数据
	$("#btn-pay").css("marginTop","2.45rem");//提交按钮的位置复原
}
var phoneTrue = false;//手机号验证是否通过，false为未通过
$("#phone").blur(checkPhone);
function checkPhone(){//手机号失焦验证
	console.log("哈哈哈");
	clearRecharge();//清除所有数据
	var phone = $("#phone").val();
	if(!phone){//验证手机号不能为空
	   $(".write-tip").html("号码不能为空");
	   $(".write-tip").css("color","red");
	   clearRecharge()
	   return;
	}
	if($("#lable").html().indexOf("44")!=-1){//根据选择的区号使用相应的正则验证手机号
		var areaNum = "44";
		if(!reg.gb.test(phone)){//验证英国手机号
		    $(".write-tip").html("手机号格式不正确");
	        $(".write-tip").css("color","red");
	        clearRecharge()
	        return;
		}
		if(phone.indexOf("0")==0){//输入的英国手机号如果有0，则去除
	   		phone = phone.replace("0","");
		}
	}else if($("#lable").html().indexOf("1")!=-1){
		var areaNum = "1";
		if(!reg.us.test(phone)){//验证美国手机号
			$(".write-tip").html("手机号格式不正确");
	        $(".write-tip").css("color","red");
	        clearRecharge()
	        return;
		}
	}
	$(".weui-toast__content").html("号码检测中");
	$("#loadingToast").fadeIn(100);
	$.ajax({//输入号码检测
		type:"post",
		url:"../center/getPackageByPhone",
		data:{
		   phoneNo:areaNum + phone
		},
		success:function(r){
			$("#loadingToast").hide();
			$(".weui-toast__content").html("数据加载中");
			if(r.success){
				//号码检测成功
				phoneTrue = true;
				recharge.changeLimit = r.data.changeLimit;//是否限制变更套餐
				recharge.currencySymbol = r.data.currencySymbol;//货币符号
				recharge.exchangeRate = r.data.exchangeRate;//汇率
				recharge.operatorId = r.data.operatorId;//运营商Id
				recharge.orgpackageId = r.data.packageId;//套餐Id
				recharge.packageName = r.data.packageName;//当前号码的套餐名称
				recharge.studentId = r.data.studentId;//用户Id
				if(r.data.priceList){//订购月数列表
				    recharge.priceList = r.data.priceList;
				}
				if(r.data.productList){//产品列表
					recharge.productList = r.data.productList;
				}
				$(".write-tip").html("请填写国外号码");
				$(".write-tip").css("color","#fff");
				dealResult();
			}else{
				//号码检测失败
				phoneTrue = false;
				clearRecharge();//清除所有数据并提示
				$(".write-tip").html(r.desc);
				$(".write-tip").css("color","red");
			}
		}
	});
}
function dealResult(){
	$(".recharge-wrapper").html("");
	if(recharge.productList){
		//后台收费模式为产品，前端页面显示充值类型按钮
		var txt = `<div class="change-wrapper">
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
				   </div>`
		$(".recharge-wrapper").html(txt);
	    $("#package-name").text(recharge.packageName);
	    putProductList(recharge.productList);//产品数据渲染
	}else{
		//后台收费模式为月份，前端页面显示订购月数
		var txt = `<div class="change-wrapper">
		    		<span>当前套餐</span><span id="package-name"></span>
		        </div>
		        <div class="package-wrapper">		        	
		            <div class="select-month-title">请选择订购月数(1个月=30天)</div>
		    		<div class="select-month">
						<select id="order-month">
	                    </select>
					</div>
					<div class="buy-info" style="margin-top:.2rem;text-align:left;padding-left:1.3rem;">
						<p class="buy-total"></p>
						<p class="buy-rmb"></p>
						<p class="buy-rate"></p>
					</div>
		        </div>`
		$(".recharge-wrapper").html(txt);
	    $("#package-name").text(recharge.packageName);
	    putPriceList();//后台收费模式为产品时订购月数数据渲染
	}

}

function putPriceList(){//后台收费模式为月份时订购月数数据渲染
	 var priceList = recharge.priceList;
	 var str = '<option value="0">请选择套餐月数</option>';
     for(var i=0;i<priceList.length;i++){
     	  var _monthNo = priceList[i].monthNo;
		  var _priceId = priceList[i].priceId;
		  var _price   = priceList[i].price;
       	  str+='<option value="'+_monthNo+'" data-price="'+_price+'" data-priceid="'+_priceId+'">'+_monthNo+'个月（共节省'+recharge.currencySymbol+(_monthNo*(priceList[0].price-_price)).toFixed(1)+'）</option>'
     }
     $("#order-month").html(str);
     moneyCount();//计算价格
     $(".package-wrapper").show();
     $("#order-month").change(function(){
     	 //月数变化时重新计算价格
     	 $(".buy-total").html("");
     	 $(".buy-rmb").html("");
		 $(".buy-rate").html("");
    	 moneyCount();
	 })
}
$(".recharge-wrapper").on("click","#original-btn",function(){
	//后台收费模式为产品时充值类型为原套餐充值
	$(".write-tip").html("请填写国外号码");
	$(".write-tip").css("color","#fff");
	$(this).addClass("checked").siblings().removeClass("checked");
	$(".package-wrapper").html('');
	$(".package-wrapper").css("paddingBottom","0");
	$(".type-desc").text("充值后用于继续购买当前套餐");
	$(".desc-tip").show();//"类型说明"四个字显示
	$(".type-desc").show();//充值类型说明内容显示
	recharge.reType = 0;
	getList(recharge.reType)
})
$(".recharge-wrapper").on("click","#only-btn",function(){
	//后台收费模式为产品时充值类型为仅充值
	$(".write-tip").html("请填写国外号码");
	$(".write-tip").css("color","#fff");
	$(this).addClass("checked").siblings().removeClass("checked");
	$(".package-wrapper").html('');
	$(".package-wrapper").css("paddingBottom","0");
	$(".type-desc").text("仅话费充值，不购买套餐");
	$(".desc-tip").show();//"类型说明"四个字显示
	$(".type-desc").show();//充值类型说明内容显示
	recharge.reType = 1;
	getList(recharge.reType);
})
$(".recharge-wrapper").on("click","#change-btn",function(){
	//后台收费模式为产品时充值类型为变更套餐
	if(recharge.changeLimit==false){//不限制变更套餐
		$(".write-tip").html("请填写国外号码");
		$(".write-tip").css("color","#fff");
		$(".desc-tip").hide();
		$(".type-desc").hide();
	    $(this).addClass("checked").siblings().removeClass("checked");
	    if(recharge.nowType!=2){
	    	  $(".package-wrapper").html(`<div class="select-package">请选择套餐</div>
			    	    <ul id="list"></ul>
			    	    <div class="package-detail-title">套餐详情</div>
			    		<div class="package-detail"></div>`);
	    }
	    recharge.reType= 2;
		getList(recharge.reType);
	}else if(recharge.changeLimit==true){//限制变更套餐并进行提示
	     $(".write-tip").html("您有订单处理中，请勿重复操作");
		 $(".write-tip").css("color","red");
	}
	
})
function getList(rechargeType){
	//后台收费模式为产品时根据传入的rechargeType显示产品列表或变更套餐列表
	if(recharge.nowType===rechargeType){
	    //两次点击同一个充值按钮不发送重复请求
	}else{
		recharge.nowType=rechargeType
		$("#loadingToast").fadeIn(100);
		$.ajax({
			type:"post",
			url:"../center/packageInfo",
			data:{
			  operatorId:recharge.operatorId,
			  packageId:recharge.orgpackageId,
			  rechargeType:rechargeType
			},
			success:function(r){
				if(r.success){					
					if(rechargeType===0||rechargeType===1){
						//传入的rechargeType为0或1显示产品列表
						putProductList(r.data.productList)
						$("#loadingToast").hide();
					}else if(rechargeType===2){
						//传入的rechargeType为2显示变更套餐列表
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
	//后台收费模式为产品时渲染变更套餐列表数据
	var packageList = packageList;
	var length = packageList.length;
	var str = "";
	for(var i=0;i<length;i++){
		var packageName = packageList[i].packageName.replace(" ","");
		str+=`<li data-id="${packageList[i].packageId}">${packageName}</li>`
	}
	$("#list").html(str);
	$("#list>li").eq(0).addClass("checked");//默认选中第一个套餐
	var one = packageList[0].packageDesc.replace(/<[^>]*>/g,"，");
	$(".package-detail").html(one);
	recharge.nowpackageId = Number($("#list>li").eq(0).attr("data-id"));//默认套餐的套餐Id
	putProductList(packageList[0].productList);
	$("#list>li").click(function(){
		$(".buy-total").html("");//每次选择套餐之前清空页面显示产品价格和产品id
		recharge.productId = null;
		if($(this).hasClass("checked")){
			//防止重复点击同一个套餐
			return;
		}
		$(this).addClass("checked").siblings().removeClass("checked");
        var index = $(this).index();
        var two = packageList[index].packageDesc.replace(/<[^>]*>/g,"，");
        $(".package-detail").html(two);
		recharge.nowpackageId = Number($(this).attr("data-id"));//选择不同套餐,更改不用套餐Id
		putProductList(packageList[index].productList);//选择不同套餐,显示相应套餐下的产品
    })
}
function putProductList(productList){
	//后台收费模式为产品时渲染产品列表数据
	recharge.productId = null;//显示相应套餐下的产品之前清空产品Id
    var str = '';
   	for(var i=0;i<productList.length;i++){
	   	  var _productName = productList[i].productName;
		  var _productId = productList[i].productId;
		  var _productPrice =productList[i].productPrice;
	   	  str+='<li  data-productprice="'+_productPrice+'" data-productid="'+_productId+'">'+_productName+'</li>'
    }
    $(".select-recharge-list").html(str);
    $(".select-recharge-list>li").click(function(){//选择不同产品进行价格计算
    	   $(".write-tip").html("请填写国外号码");
		   $(".write-tip").css("color","#fff");
	   	   $(this).addClass("checked").siblings().removeClass("checked");
	   	   moneyCount();
    })
    $("#btn-pay").css("marginTop","0.25rem");
}
function moneyCount(){
	if(recharge.productList){//后台收费模式为产品时根据产品计算价格	
		 var ele = $(".select-recharge-list>li[class='checked']");
		 var _productprice = ele.attr("data-productprice");
		 recharge.productId = ele.attr("data-productid");
		 var symt = recharge.currencySymbol + _productprice;
		 var rmb = _productprice*recharge.exchangeRate;
	     $(".buy-total").html('总计:'+symt+'=<strong>'+rmb.toFixed(2)+'CNY</strong>');
	}else{//后台收费模式为月份时根据月数计算价格
		var val = $("select").val();
		if(val!=0){			
	 	    var month = Number(val);
	 	    var preprice = Number($("option[value='"+val+"']").attr("data-price"));
	 	    recharge.priceId = $("option[value='"+val+"']").attr("data-priceid");
			var totalPrice = month*preprice;
			var rmb = totalPrice*recharge.exchangeRate;
			var symt= recharge.currencySymbol+totalPrice.toFixed(2);//货币符号+总价
		    $(".buy-total").html('总计：'+recharge.currencySymbol+preprice+'*'+month+'=<strong>'+symt+'</strong>');
		    $(".buy-rmb").html(symt+'=<strong>'+rmb.toFixed(2)+'CNY</strong>');
		    $(".buy-rate").html("汇率："+recharge.currencySymbol+"1.00="+recharge.exchangeRate+"CNY");
		    $("#btn-pay").css("marginTop","0.25rem");
		}else{
			$("#btn-pay").css("marginTop","0.75rem");
		}
	}
}
var canPay = true;//防止充值下单重复提交的标识
$("#btn-pay").on('touchstart',function(){
	$(this).css('backgroundColor','#a23872');
})
$("#btn-pay").on('touchend',function(){
	$(this).css('backgroundColor','#ca1d7b');
})
$("#btn-pay").click(function(){
	 var phone = $("#phone").val();
	 if(!phone){
	 	//充值下单提交时号码不能为空
	 	$(".write-tip").html("号码不能为空");
		$(".write-tip").css("color","red");
	    clearRecharge();
	    $("body").scrollTop(0);
		return;
	 }
	 if($("#lable").html().indexOf("44")!=-1){
		var areaNum = "44";
		if(!reg.gb.test(phone)){
		    //充值下单提交时区号为44验证相应的手机号
		    $(".write-tip").html("手机号格式不正确");
	        $(".write-tip").css("color","red");
	        clearRecharge();
	        return;
		}
		if(phone.indexOf("0")==0){
			//针对英国号码，用户输入0开头的号码默认去除
	   		phone = phone.replace("0","");
		}
	 }else if($("#lable").html().indexOf("1")!=-1){
		var areaNum = "1";
		if(!reg.us.test(phone)){
			//充值下单提交时区号为1验证相应的手机号
			$(".write-tip").html("手机号格式不正确");
	        $(".write-tip").css("color","red");
	        clearRecharge();
	        return;
		}
	 }
	 if(!phoneTrue){
	 	//充值下单提交时号码验证未通过
	 	$(".write-tip").html("号码不存在");
		$(".write-tip").css("color","red");
        clearRecharge();
	    $("body").scrollTop(0);
		return;
	 }
	 if(recharge.productList){
	 	//后台收费模式为产品时验证是否选择充值类型和充值金额
		 if(recharge.reType===null){
		 	$(".write-tip").html("请选择充值类型");
			$(".write-tip").css("color","red");
			$("body").scrollTop(0);
			return;
		 }
		 if(recharge.productId===null){
		 	$(".write-tip").html("请选择充值金额");
			$(".write-tip").css("color","red");
			$("body").scrollTop(0);
			return;
	 	 }
	 }else{
	 	//后台收费模式为月份时验证是否选择月数
	 	 if(recharge.priceId===null){
		 	$(".write-tip").html("请选择订购月数");
			$(".write-tip").css("color","red");
			$("body").scrollTop(0);
			return;
	 	 }
	 }
	 if(recharge.productList){
	 	   //后台收费模式为产品时且充值类型为原套餐充值或仅充值时发送的请求数据
		 	if(recharge.reType===0||recharge.reType===1){
		 		var sendData = {
		 			 studentId:recharge.studentId,
		 			 phoneNo:areaNum+phone,
		 			 packageId:recharge.orgpackageId,
		 			 rechargeType:recharge.reType,
		 			 productId:recharge.productId,
		 			 orderSource:0,
		 			 openId:openId
		 		}
		 	}else{
		 	   //后台收费模式为产品时且充值类型为变更套餐时发送的请求数据
		 	   var sendData = {
		 			 studentId:recharge.studentId,
		 			 phoneNo:areaNum+phone,
		 			 packageId:recharge.nowpackageId,
		 			 rechargeType:recharge.reType,
		 			 productId:recharge.productId,
		 			 orderSource:0,
		 			 openId:openId
		 	    }
		 	}
	 }else{
	 	//后台收费模式为月份时的请求数据
 		var sendData = {
 			 studentId:recharge.studentId,
 			 phoneNo:areaNum+phone,
 			 packageId:recharge.orgpackageId,
 			 rechargeType:0,
 			 priceId:recharge.priceId,
 			 orderSource:0,
 			 openId:openId
	 	 }
	 }
	 if(canPay){
	 	canPay = false;//防止重复提交
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
