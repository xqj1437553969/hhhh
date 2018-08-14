import '../css/prepaidDetail.css';
function getQueryString(str) {
	var reg = new RegExp("(^|&)" + str + "=([^&]*)(&|$)", "i");
	var r = window.location.search.substr(1).match(reg);
	if (r != null)
		return unescape(r[2]);
	return null;
}
var prepaidType = Number(getQueryString("prepaidType"));
var sendData = "";
if(prepaidType==1){
	var openId = sessionStorage.getItem("openId");
  	sendData = {
  		type:prepaidType,
		openId:openId
  	}
}else if(prepaidType==0){
	var studentId = JSON.parse(localStorage.getItem("student")).studentId;
	sendData = {
  		type:prepaidType,
		studentId:studentId
  }
}
getData();
function getData(){
	$("#loadingToast").fadeIn(100);
	$.ajax({
		type:"post",
		url:"../center/rechargeRecord",
		data:sendData,
		success:function(r){
			$("#loadingToast").fadeOut(100);
			if(r.success){
				putData(r.data.record);
			}
		}
	});
}
function putData(items){
	var index =  Number(sessionStorage.getItem("prepaidIndex")); 
	var item =items[index];
//	console.log(item);
	var orderNo = item.orderNo;
	var countryName = item.countryName;
	var phoneNo = item.phoneNo;
	var productName = item.productName;
	var monthNo = item.monthNo;
	var packageName = item.packageName;
	var orderPirce = item.orderPirce;
	var orderStatus = item.orderStatus;
	var operatorName = item.operatorName;
	var rechargeType = item.rechargeType;
	var changeStatus = item.changeStatus;
	if(productName){
		var productStr = `<li><span class="info-left">充值金额</span><span class="info-right">${productName}</span></li>`
    }else{
    	var productStr = '';
	}
    if(monthNo){
		var monthStr = `<li><span class="info-left">订购月数</span><span class="info-right">${monthNo}</span></li>`
	}else{
		var monthStr = '';
	}
	if(orderStatus=="充值失败"){
		$(".contact-refund").show();
	}else{
		$(".contact-refund").hide();
	}
	if(changeStatus){
		var strChangeStatus =  `<li><span class="info-left">变更状态</span><span class="info-right">${changeStatus}</span></li>`;
		if(orderStatus=="已支付"&&changeStatus=="未处理"){
		   $(".contact-change").show();
	    }else{
	       $(".contact-change").hide();
	    }
	}else{
		var strChangeStatus = "";
	}
	var createTime = formatToTime(item.createTime);
	var str = `<li><span class="info-left">订单编号</span><span class="info-right">${orderNo}</span></li>
			   <li><span class="info-left">国家</span><span class="info-right">${countryName}</span></li>
			   <li><span class="info-left">运营商</span><span class="info-right">${operatorName}</span></li>
			   <li><span class="info-left">充值号码</span><span class="info-right">${phoneNo}</span></li>
			   <li><span class="info-left">充值类型</span><span class="info-right">${rechargeType}</span></li>
			   ${productStr}
			   ${monthStr}
			   <li><span class="info-left">套餐名称</span><span class="info-right">${packageName}</span></li>
			   ${strChangeStatus}
			   <li><span class="info-left">订单价格</span><span class="info-right">${orderPirce}CNY</span></li>
			   <li><span class="info-left">订单状态</span><span class="info-right">${orderStatus}</span></li>
			   <li><span class="info-left">提交时间（北京时间）</span><span class="info-right">${createTime}</span></li>`
	$(".buy-info").html(str);
}
