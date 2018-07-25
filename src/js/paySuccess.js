import '../css/paySuccess.css';
var openId = sessionStorage.getItem("openId");
if(openId){
	$.ajax({
		type:"post",
		url:"../ctrip/uploadVisitInfo",
		data:{
			addressId:6,
			openId:openId
		},
		success:function(r){
			
		}
   });
}
