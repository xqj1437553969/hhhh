import '../css/prepaidSuccess.css';
var openId = sessionStorage.getItem("openId");
if(openId){
	$.ajax({
		type:"post",
		url:"../ctrip/uploadVisitInfo",
		data:{
			addressId:11,
			openId:openId
		},
		success:function(r){
			
		}
   });
}