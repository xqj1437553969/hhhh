import '../css/appselect-card.css';
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
function getQueryString(str) {
	var reg = new RegExp("(^|&)" + str + "=([^&]*)(&|$)", "i");
	var r = window.location.search.substr(1).match(reg);
	if (r != null)
		return unescape(r[2]);
	return null;
}
//var code = getQueryString("code");
var type = getQueryString("type");
//var openId = null;
var j = null;
var result = null;
//console.log(code,type);
if(type){
	sessionStorage.setItem("type",type);
}
var $loadingToast = $("#loadingToast");
$loadingToast.show();
$.ajax({
	type:"post",
	url:"../center/cardOperator",
	data:{
		orderSource:2
	},
	success:function(r){
		$loadingToast.hide();
		if(r.success){
			result = r;
			putCountry(r,0);
			$(".container").show();
		}else{
			window.location.href = r.desc;
		}
	}
});
function putCountry(r,datatype){
	var operatorList = r.data.operatorList;
 	for(var i=0;i<operatorList.length;i++){
    	if(operatorList[i].countryName=="英国"&&operatorList[i].operatorName.indexOf("gaff")!=-1){
            $(".apply .switch-area .two").css("background","url("+operatorList[i].cardImgUrl+") 0 0 no-repeat");
            $(".apply .switch-area .two").css("backgroundSize","100%"); 
    	}
    	if(operatorList[i].countryName=="美国"&&operatorList[i].operatorName.indexOf("bile")!=-1){
    		$(".apply .switch-area .three").css("background","url("+operatorList[i].cardImgUrl+") 0 0 no-repeat"); 
    		$(".apply .switch-area .three").css("backgroundSize","100%");
    	}
    }
    for(var i=0;i<operatorList.length;i++){
    	if(datatype===0&&operatorList[i].countryName=="英国"&&operatorList[i].operatorName.indexOf("gaff")!=-1){
    		 j = i;
    		 sessionStorage.setItem("cardtype","Giffgaff");
    		 break;
    	}
    	if(datatype===4&&operatorList[i].countryName=="美国"&&operatorList[i].operatorName.indexOf("bile")!=-1){
    		 j = i;
    		 sessionStorage.setItem("cardtype","T-mobile");
    		 break;
    	}
    }
	var uk = operatorList[j];
	sessionStorage.setItem("operatorId",uk.operatorId);
	var img = uk.cardImgUrl;
//	$("#card-img").html(`<img src="${img}"/>`);
	var data = uk.packageList;
	var str = "";
	for(var i=0;i<data.length;i++) {
		var item = data[i];
		var packageName = item.packageName;
		var money = packageName.split(" ")[0];
		var name =  packageName.split(" ")[1]; 
//		console.log(money);
      	str+=` <li>
			    	<div class="package-name left"><strong>${money}</strong><br/>${name}</div>
			    	<div class="package-content right">${item.packageDesc}</div>
			   </li>`
	}
	str+=`<li></li>`;
	$("#list").html(str);
	if(datatype===0){		
		$("#charge-title").text("Giffgaff卡资费详情");
		$("#list>li>.right").css({"text-align":"center","padding-left":"0"});
		$("#package-title>.right").css("paddingLeft","0");
	}else if(datatype===4){
		$("#charge-title").text("T-Mobile卡资费详情");
		$("#list>li>.package-content").css({"text-align":"left","padding-left":".09rem"});
		$("#package-title>.right").css("paddingLeft",".09rem");
	}else{
		
	}
}

$(".tab").click(function(){//两张图
	var target = $(this);
	if(target.hasClass("right")){
		if(target.attr("data-type")==="4"){
			target.removeClass("right").addClass("center checked")
			.prev().removeClass("center checked ").addClass("left down")
			.prev().removeClass("left down").addClass("right");
			putCountry(result,4);
		}else if(target.attr("data-type")==="0"){
			 target.removeClass("right").addClass("center checked")
			.prev().removeClass("center checked ").addClass("left down")
			.next().next().removeClass("left down").addClass("right");
			putCountry(result,0);
		}else{
			
		}
	
	}else if(target.hasClass("left")){
		 if(target.attr("data-type")==="4"){
			target.removeClass("left").addClass("center checked")
			.prev().prev().removeClass("center checked down").addClass("right down")
			.next().removeClass("right down").addClass("left");
			putCountry(result,4);
		}else if(target.attr("data-type")==="0"){
			target.removeClass("left").addClass("center checked")
			.next().removeClass("center checked ").addClass("right down")
			.prev().prev().removeClass("right down").addClass("left");
			putCountry(result,0);
		}else{
			
		}
	}else{
		
	}
})
$("#btn-free").on('touchstart',function(){
	$(this).css('backgroundColor','#a23872');
})
$("#btn-free").on('touchend',function(){
	$(this).css('backgroundColor','#ca1d7b');
})
$("#btn-free").click(function(){
	window.location.href = "appgetCard.html"
})

$("#know").click(function(){
	$("#iosDialog2").fadeOut(200);
})
