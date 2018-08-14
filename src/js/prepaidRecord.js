import '../css/prepaidRecord.css';
function getQueryString(str) {
	var reg = new RegExp("(^|&)" + str + "=([^&]*)(&|$)", "i");
	var r = window.location.search.substr(1).match(reg);
	if (r != null)
		return unescape(r[2]);
	return null;
}
var myScroll = new IScroll("#wrapper",{//初始化iscroll
	hScrollbar:false,
    vScroll:true,
    bounce:false,
    click:true,    
    hideScrollbar: true
});
var prepaidRecords = null;
var dataLength = null;
var sendData = null;
var prepaidType = Number(getQueryString("prepaidType"));
var pageUrl = null;
if(prepaidType==1){
	var openId = sessionStorage.getItem("openId");
  	sendData = {
  		type:prepaidType,
		openId:openId
  	}
  	pageUrl = "prepaidDetail.html?prepaidType=1"
}else if(prepaidType==0){
	var studentId = JSON.parse(localStorage.getItem("student")).studentId;
	sendData = {
  		type:prepaidType,
		studentId:studentId
  	}
	pageUrl = "prepaidDetail.html?prepaidType=0";
}
console.log(sendData);
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
				putData(r);
			}
		}
	});
}
function putData(r){
	var recordList = r.data.record;
	prepaidRecords = recordList.reverse();
	var length = prepaidRecords.length;
	dataLength = length;
	if(length==0){
		$("#wrapper").append("<div class='tip'>您的充值记录是空的！</div>");
	}else{
		var str='';
		for(var i=0;i<length;i++){
			var recordItem = recordList[i];
			var phoneNo = recordItem.phoneNo;
			var productName = recordItem.productName;
			var monthNo = recordItem.monthNo;
			var orderPirce = recordItem.orderPirce;
			var orderStatus = recordItem.orderStatus;
			var createTime = formatToTime(recordItem.createTime);
			if(productName){
		    	var productStr = `<div><span class="info-left">充值金额</span><span class="info-right">${productName}</span></div>`
		    }else{
		    	var productStr = '';
   			}
		    if(monthNo){
    			var monthStr = `<div><span class="info-left">订购月数</span><span class="info-right">${monthNo}</span></div>`
   			}else{
    			var monthStr = '';
   			}
			str+=`<li class="prepaid-info">
					<div><span class="info-left">充值号码</span><span class="info-right">${phoneNo}</span></div>
					${productStr}
			   		${monthStr}
					<div><span class="info-left">订单价格</span><span class="info-right">${orderPirce}CNY</span></div>
					<div><span class="info-left">订单状态</span><span class="info-right">${orderStatus}</span></div>
					<div><span class="info-left">提交时间（北京时间）</span><span class="info-right">${createTime}</span></div>
					<span class="position-icon">></span>
				</li>`
		}
		$(".list").html(str);
	    myScroll.refresh();//iscroll刷新
		
	}
}

$(".list").on("click",".prepaid-info",function(){//点击每个购买记录跳转到购买详情
    var prepaidIndex =dataLength-1-Number($(this).index());
    sessionStorage.setItem("prepaidIndex",prepaidIndex);
	location.href = pageUrl;
})
