import '../css/cardRecord.css';
var studentId = JSON.parse(localStorage.getItem("student")).studentId;
$("#loadingToast").fadeIn(100);
$.ajax({
	type:"post",
	url:"../center/orderRecord",
	data:{
	   studentId:studentId
	},
	success:function(r){
		$("#loadingToast").fadeOut(100);
//		console.log(r);
		if(r.success){
		   putRecord(r.data);
		}
	}
});
function putRecord(res){
	var cardRecordList = res.record.reverse();
    var length = cardRecordList.length;
    if(length==0){
		$(".container").append("<div class='tip'>您的领卡记录是空的！</div>");
	}else{
		$(".tip").remove();
		var str = "";
	    for(var i=0;i<length;i++){
	    	var cardRecord = cardRecordList[i];//订单列表
	    	var operatorName = cardRecord.operatorName;//运营商名称
	    	var createTime = formatToTime(cardRecord.createTime);//订单提交时间
	    	var orderAddress = cardRecord.orderAddress;//收货地址
	    	var orderId = cardRecord.orderId;//订单id
	    	var orderStatus = cardRecord.orderStatus;//订单状态
	    	var courierCompany = cardRecord.courierCompany;//快递公司
	    	var courierNo = cardRecord.courierNo;//快递单号
	    	if(courierCompany==undefined){
	    		courierCompany = "暂未填写";
	    		courierNo = "暂未填写"
	    	}
	    	var cancel = "";
	    	var courier = "";
	    	if(orderStatus=="未处理"){
	    		cancel = `<p class="p-cancel" data-id="${orderId}">取消</p>`;
	    	}else if(orderStatus=="已取消"){
	    		cancel = `<p class="margin"><span class="left">订单状态</span><span class="right">${orderStatus}</span></p>`
	    	}else{
	    		courier = `<p class="margin" id="courier-company"><span class="left">快递公司</span><span class="right">${courierCompany}</span></p>
					<p class="margin" id="courier-no"><span class="left">快递单号</span><span class="right">${courierNo}</span></p>`
	    		cancel = `<p class="margin"><span class="left">订单状态</span><span class="right">${orderStatus}</span></p>`
	    	}
	    	str+=`<li>
					<p id="send-address">配送地址</p>
					<p class="margin">${orderAddress}</p>
				    <p class="margin"><span class="left">卡类型</span><span class="right">${operatorName}</span></p>
					${courier}
					<p class="margin"><span class="left">提交时间</span><span class="right">${createTime}</span></p>
					${cancel}
				</li>`
	    }
    	$("#list").html(str);
	}
    
}
$("#list").on("click",".p-cancel",function(){
//	 console.log($("").siblings("#send-title"));
//   var that = this;
	 var recordId = $(this).attr("data-id");
//	 recordId = Number(recordId)
	 $("#iosDialog1").fadeIn(200);
	 $("#ensure").attr("data-id",recordId)
	
})
$("#cancel").click(function(){//点击弹出层取消按钮
	$("#iosDialog1").fadeOut(200);
})
$("#ensure").click(function(){//点击弹出层确定按钮
	 var ensureId = $(this).attr("data-id");
	 ensureId = Number(ensureId);
	 $.ajax({
	 	type:"post",
	 	url:"../center/cancelFreeCard",
	 	data:{
	 		recordId:ensureId
	 	},
	 	success:function(r){
//	 		console.log(r);
	 		if(r.success){
	 			$(".p-cancel[data-id='"+ensureId+"']").parent().append(`<p class="margin"><span class="left">订单状态</span><span class="right">已取消</span></p>`)
	 			$(".p-cancel[data-id='"+ensureId+"']").remove();
	 			$("#iosDialog1").fadeOut(200);
	 		}
	 	}
	 });
})
