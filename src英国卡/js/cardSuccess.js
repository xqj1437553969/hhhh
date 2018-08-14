import '../css/cardSuccess.css';
var openId = sessionStorage.getItem("openId");
if(openId){
	$.ajax({
		type:"post",
		url:"../ctrip/uploadVisitInfo",
		data:{
			addressId:9,
			openId:openId
		},
		success:function(r){
			
		}
   });
}
