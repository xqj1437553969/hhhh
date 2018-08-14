import '../css/businessDetail.css';
$(function(){
    FastClick.attach(document.body);
	//确定取消弹出层
    var $iosDialog1 = $('#iosDialog1');
    $('#cancel').on('click', function(){
        $(this).parents('.js_dialog').fadeOut(200);
    });
    $("#showIOSDialog1").on('touchstart',function(){
		$(this).css('backgroundColor','#a23872');
    })
	$("#showIOSDialog1").on('touchend',function(){
		$(this).css('backgroundColor','#ca1d7b');
	})
    $('#showIOSDialog1').on('click', function(){
        $iosDialog1.fadeIn(200);
    });
});
var orderNo = null;
var openId = sessionStorage.getItem("openId");//openId
var student = JSON.parse(localStorage.getItem("student"));
var detailId = Number(sessionStorage.getItem("buyIndex"));
var activateDateEarliest = null;
//console.log(openId,student,detailId);
getDetail();
function getDetail(){
	$("#loadingToast").fadeIn(100);
	$.ajax({
		type:"post",
		url:"../center/packageOrderRecord",
		data:{
		  studentId:student.studentId
		},
		success:function(r){
		   $("#loadingToast").fadeOut(100);
		   putDetail(r.data.record[detailId]);
		}
	});
}
function putDetail(info){
//	console.log(info);
	var phoneStr = "";
	var phoneNo = info.phoneNo;
	if(phoneNo){
	   phoneStr = `<li><span class="info-left">国外号码</span><span class="info-right">${phoneNo}</span></li>`;
	}
	var usernameStr = "";
	var username = info.username;
	if(username){
	   usernameStr = `<li><span class="info-left">Giffgaff帐号</span><span class="info-right">${username}</span></li>`;
	}
	var pswordStr = "";
	var psword = info.password;
	if(psword){
	   pswordStr = `<li><span class="info-left">Giffgaff密码</span><span class="info-right">${psword}</span></li>`;
	}
	var cardNo =info.cardNo;//卡号
    var packageName = info.packageName.replace(" ","");//套餐名称
    var productname = info.productname;//充值金额
    var price = info.orderPirce;//订单价格
    var orderSource = info.orderSource;//支付方式
    var orderStatus = info.orderStatus;//订单状态
    var activateDate = formatToDate(info.activateDate);//激活日期
    var limitUpdateDate = info.limitUpdateDate;//是否可以修改
    var activateDatePrompt = info.activateDatePrompt;
    var operatorName = info.operatorName;
    var countryName  = info.countryName;
    var datePromptStr = null;
    if(activateDatePrompt){
    	datePromptStr = `<li><span class="info-left">激活日期（${activateDatePrompt}）</span><span class="info-right">${activateDate}</span></li>`
    }else{
    	datePromptStr = `<li><span class="info-left">激活日期</span><span class="info-right">${activateDate}</span></li>`
    }
    if(!limitUpdateDate){    	
    	activateDateEarliest = info.activateDateEarliest;
    }
    orderNo = info.orderNo;//订单号
//  console.log(limitUpdateDate);
    isPay(limitUpdateDate,orderStatus);
    var createTime = formatToTime(info.createTime);//订单提交时间
    var str = `${phoneStr}
               ${usernameStr}
               ${pswordStr}
               <li><span class="info-left">卡号</span><span class="info-right">${cardNo}</span></li>
               <li><span class="info-left">国家</span><span class="info-right">${countryName}</span></li>
			   <li><span class="info-left">运营商</span><span class="info-right">${operatorName}</span></li>
			   <li><span class="info-left">套餐名称</span><span class="info-right">${packageName}</span></li>
			   <li><span class="info-left">充值金额</span><span class="info-right">${productname}</span></li>
			   <li><span class="info-left">订单价格</span><span class="info-right">${price}CNY</span></li>
			   <li><span class="info-left">订单来源</span><span class="info-right">${orderSource}</span></li>
			   <li><span class="info-left">订单状态</span><span class="info-right">${orderStatus}</span></li>
			   ${datePromptStr}
			   <li><span class="info-left">提交时间（北京时间）</span><span class="info-right">${createTime}</span></li>`
    $(".buy-info").html(str);
}
function isPay(limt,status){
	if(status=="未支付"){
		$(".btn-continue-pay").show();
		$(".btn-cancel-pay").show();
	}else{
		$(".btn-continue-pay").hide();
		$(".btn-cancel-pay").hide();
	}
	console.log(limt);
	if(limt){
		$(".modification-btn").hide();
	}else{
		$(".modification-btn").show();
	}
//	console.log(status=="未支付"&& !limt);
	if(status=="未支付" && !limt){
		$(".btn-continue-pay").css("marginTop","0.1rem");
		$(".modification-btn").css("marginTop","0.22rem");
	}
}
var flag = true;
$(".btn-continue-pay").on('touchstart',function(){
	$(this).css('backgroundColor','#a23872');
})
$(".btn-continue-pay").on('touchend',function(){
	$(this).css('backgroundColor','#ca1d7b');
})
$(".btn-continue-pay").click(function(){
	if(flag){
		flag = false;
		$("#loadingToast").fadeIn(100);
		$.ajax({
			type:"post",
			url:"../center/continuePay",
			data:{
			   openId:openId,
			   payType:0,
			   orderNo:orderNo
			},
			success:function(r){
//				console.log(r);
				$("#loadingToast").hide();
				if(r.success){
					 function onBridgeReady(){
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
					           	   flag = true;
					           	   location.href="paySuccess.html";
					           }else{
					           	   flag = true;
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
				}else{
					$("#tip-info").html(r.desc);
					$("#massage-tell").fadeIn(200);
					flag = true;
				}
			}
	   });
    }
	
})

$("#continue").click(function(){//点击确定取消订单的确定按钮
//	$("#loadingToast").fadeIn(100);
	$.ajax({
		type:"post",
		url:"../center/cancelOrder",
		data:{
		   openid:openId,
		   orderNo:orderNo
		},
		success:function(r){
//			console.log(r);
//          $("#loadingToast").fadeOut(100);
			if(r.success){
				getDetail();
				$('#iosDialog1').fadeOut(200);
			}else{
				$("#tip-info").html(r.desc);
				$("#massage-tell").fadeIn(200);
			}
		}
	});
})

//激活日期修改
$(".modification-btn").click(function(){//点击修改激活日期按钮，弹出层出现
	$("#date").html("请选择激活日期（英国日期）")
	$("#change-date").fadeIn(200);
});
$('.x-btn').on('click', function(){//点击弹出层x号，弹出层消失
    $("#change-date").fadeOut(200);
});
$("#date").click(function(){//点击请选择激活日期
	    var firstDay = getDate(activateDateEarliest);
		weui.datePicker({
			start : firstDay, // 从今天开始
			end : 2030,
			defaultValue : [ firstDay.getFullYear(), firstDay.getMonth() + 1, firstDay.getDate() ],
			onConfirm : function(result) {
				console.log(result);
				var x = result[0].value + "-" + (result[1].value < 10 ? ('0' + result[1].value) : result[1].value) + "-" + (result[2].value < 10 ? ('0' + result[2].value) : result[2].value);
				$("#date").html(x);
			},
			id : 'datePicker'
		});
})
$("#sub").click(function(){//点击选择修改日期弹出层的提交按钮
	var txt = $("#date").html();
	console.log(txt.indexOf("请选择激活日期"));
	if(txt.indexOf("请选择激活日期")!=-1){
		alert("请选择激活日期");
		return;
	}
	revise();
})
function revise(){
	var reviseDate = $("#date").html();
	$("#loadingToast").fadeIn(100);
	$.ajax({
		type:"post",
		url:"../center/updateActivateDate",
		data:{
			orderNo:orderNo,
			activateDate:reviseDate
		},
		success:function(r){
			$("#loadingToast").fadeOut(100);
			if(r.success){
				getDetail();
				$("#change-date").fadeOut(200);
				$("#tip-info").html("修改激活日期成功");
				$("#massage-tell").fadeIn(200);
			}else{
				$("#change-date").fadeOut(200);
				$("#tip-info").html(r.desc);
				$("#massage-tell").fadeIn(200);
			}
		}
	});
}

	
$("#know").click(function(){//点击知道了消息通知层消失
	$("#massage-tell").fadeOut(200);
})