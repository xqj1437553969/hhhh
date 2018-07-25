import '../css/businessRecord.css';
$(function() {
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
var myScroll = new IScroll("#wrapper",{//初始化iscroll
	hScrollbar:false,
    vScroll:true,
    bounce:false,
    click:true,    
    hideScrollbar: true
});
var details = null;
var dataLength = null;
var studentId = JSON.parse(localStorage.getItem("student")).studentId;
studentId = Number(studentId);
$("#loadingToast").fadeIn(100);
$.ajax({
	type:"post",
	url:"../center/packageOrderRecord",
	data:{
		studentId:studentId
	},
	success:function(r){
		$("#loadingToast").fadeOut(100);
		if(r.success){
		   putData(r.data.record)
		}
	}
});
function putData(res){
	details = res.reverse();
	dataLength = details.length;
	if(dataLength==0){
		$("#wrapper").append("<div class='tip'>您的开通记录是空的！</div>");
	}else{
		$(".tip").remove();
		var str = "";
	    for(var i=0;i<dataLength;i++){
	    	var phoneStr = "";
	    	var phoneNo = res[i].phoneNo;
	    	if(phoneNo){
	    		phoneStr = `<div><span class="info-left">国外号码</span><span class="info-right">${phoneNo}</span></div>`;
	    	}
	    	var cardNo =res[i].cardNo;
	    	var packageName = res[i].packageName.replace(" ","");
	    	var orderStatus = res[i].orderStatus;
	    	var createTime = formatToTime(res[i].createTime);
	    	var activateDate = formatToDate(res[i].activateDate);
	    	var activateDatePrompt = res[i].activateDatePrompt;
	    	if(activateDatePrompt){
	    		var datePromptStr=`<div><span class="info-left">激活日期（${activateDatePrompt}）</span><span class="info-right">${activateDate}</span></div>`
	    	}else{
	    		var datePromptStr=`<div><span class="info-left">激活日期</span><span class="info-right">${activateDate}</span></div>`	    		
	    	}
	    	str+=`<li class="activate-info">
	    	        ${phoneStr}
					${datePromptStr}
					<div><span class="info-left">套餐名称</span><span class="info-right">${packageName}</span></div>
					<div><span class="info-left">订单状态</span><span class="info-right">${orderStatus}</span></div>
					<div><span class="info-left">提交时间（北京时间）</span><span class="info-right">${createTime}</span></div>
					<span class="position-icon">></span>
				</li>`
	    }
	    $(".list").html(str);
	    myScroll.refresh();//iscroll刷新
	}
}
$(".list").on("click",".activate-info",function(){//点击每个购买记录跳转到购买详情
    var detaiId =dataLength-1-Number($(this).index());
  	sessionStorage.setItem("buyIndex",detaiId);
	location.href="businessDetail.html";
})