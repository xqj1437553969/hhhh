import '../css/information.css';
$(function() {
    pushHistory();
});
function pushHistory() {
    window.addEventListener("popstate", function(e) {
           self.location.reload();
    }, false);
    var state = {
        title : "",
        url : ""
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
var openId = null;
var nickname = null;
var headurl = null;
var student = null;
getData();
function getData(){
	$("#loadingToast").fadeIn(100);
	$.ajax({
		type:"post",
		url:"../center/information",
		data:{
			code:code
		},
		success:function(r){
			$("#loadingToast").fadeOut(100);
			if(r.success){
				openId = r.data.openId;
				nickname = r.data.nickname;
				headurl = r.data.headurl;
				sessionStorage.setItem("openId",openId);
				sessionStorage.setItem("nickname",nickname);
				sessionStorage.setItem("headurl",headurl);
				if(!r.data.student){
					window.location.href = "login.html";
				}else{
					$(".container").show();
					student = r.data.student;
					localStorage.setItem("student",JSON.stringify(student));
				}
			}else if(r.code==2){
				window.location.href = r.desc;
			}else{
				window.location.href = "not-exist.html";
			}
		}
   });
}

$("#improve-info").click(function(){
	 window.location.href = "userInfo.html";
})
$("#card-record").click(function(){
	 window.location.href = "cardRecord.html";
})
$("#business-record").click(function(){
	 window.location.href = "businessRecord.html";
})
$("#prepaid-record").click(function(){
	 window.location.href = "prepaidRecord.html?prepaidType=0";
})
$("#recommend").click(function(){
	 window.location.href = "recommend.html";
})
$("#btn-logout").on("touchstart",function(){
	$(this).css("backgroundColor","#a23872");
})
$("#btn-logout").on("touchend",function(){
	$(this).css("backgroundColor","#ca1d7b");
})
var canLogout = true;
$("#btn-logout").click(function(){//点击退出登录
	console.log(student);
	var studentId = student.studentId;
	if(canLogout){
		canLogout = false;
		$.ajax({
			type:"post",
			url:"../center/logout",
		    data:{
		       studentId:studentId
		    },
		    success:function(r){
		      if(r.success){
		      	 localStorage.removeItem("student");
		      	 layer.msg("登出成功");
		      	 setTimeout(function() {
		      	     canLogout = true;
					 location.href = 'login.html'
				 }, 500)
		      }
		    }
	    });
	}
	
})
