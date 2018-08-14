import '../css/select-card.css';
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
var code = getQueryString("code");
var type = getQueryString("type");
var sceneId = getQueryString("sceneId");
var phone = null;
var openId = null;
var nickname = null;
var headurl = null;
var index = null;
if(type){
	sessionStorage.setItem("type",type);
}
if(sceneId){
	sessionStorage.setItem("sceneId",sceneId);
}
var $loadingToast = $("#loadingToast");
$loadingToast.show();
$.ajax({
	type:"post",
	url:"../center/cardOperator",
	data:{
		orderSource:0,
		code:code
	},
	success:function(r){
		$loadingToast.hide();
		if(r.success){
			openId = r.data.openId;
			nickname = r.data.nickname;
			headurl = r.data.headurl;
			sessionStorage.setItem("openId",openId);
			sessionStorage.setItem("nickname",nickname);
			sessionStorage.setItem("headurl",headurl);
			sendCount(openId);
			putCountry(r);
			$(".container").show();
		}else if(r.code==2){
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
			addressId:7,
			openId:openId
		},
		success:function(r){
			
		}
	});
}
function putCountry(r){
	phone = r.data.phone;
	var operatorList = r.data.operatorList;

    for(var j=0;j<operatorList.length;j++){
    	if(operatorList[j].countryName=="英国"&&operatorList[j].operatorName.indexOf("gaff")!=-1){
    		index = j;
    	}
    }
	var uk = operatorList[index];
	sessionStorage.setItem("operatorId",uk.operatorId);
	var img = uk.cardImgUrl;
	$("#card-img").html(`<img src="${img}"/>`)
	var data = uk.packageList;
	var str = "";
	for(var i=0;i<data.length;i++) {
		var item = data[i];
		var packageName = item.packageName;
		var money = packageName.split(" ")[0];
		var name =  packageName.split(" ")[1]; 
      	str+=` <li>
			    	<div class="package-name left"><strong>${money}</strong><br/>${name}</div>
			    	<div class="package-content right">${item.packageDesc}</div>
			   </li>`
	}
	str+=`<li></li>`;
	$("#list").html(str);
}
$("#btn-free").on('touchstart',function(){
	$(this).css('backgroundColor','#a23872');
})
$("#btn-free").on('touchend',function(){
	$(this).css('backgroundColor','#ca1d7b');
})
$("#btn-free").click(function(){
	window.location.href = "getCard.html"
})

$("#know").click(function(){
	$("#iosDialog2").fadeOut(200);
})
