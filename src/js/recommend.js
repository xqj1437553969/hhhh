import '../css/recommend.css';
var student = JSON.parse(localStorage.getItem("student"))
var imgurl = "";
if(!student.qrcode){
   $("#btn").show();
   $(".qrcode-wrapper").hide();
   $(".recommend-wrapper").hide();
}else{
   $("#btn").hide();
   $(".qrcode-wrapper").html(`<div class="qrcode"><img id="qrimg" src="${student.qrcode}" alt="" /><p>点击图片放大</p></div>`);
   getRecord();
}

function getRecord(){
	$("#loadingToast").fadeIn(100);
	$.ajax({
	 	type:"post",
	 	url:"../center/recommendRecord",
	    data:{
	    	studentId:student.studentId
	    },
	    success:function(r){
	    	$("#loadingToast").fadeOut(100);
	    	if(r.success){
	    	   var records = r.data.record;
	    	   var str = `<li><span>微信头像</span><span>微信昵称</span><span>卡类型</span></li>`;
	    	   if(records.length===0){
	    	   	   $("#count").text(records.length)
	    	   	   $("ul").html(str);
	    	   }else{
	    	   	   $("#count").text(records.length)
		    	   for(var i=0;i<records.length;i++){
		    	   	  str+=`<li><span><img src="${records[i].headurl}" alt="" /></span><span>${records[i].nickname}</span><span>${records[i].operatorName}</span></li>` 
		    	   }
		    	   $("ul").html(str);
	    	   }
	    	   $(".qrcode-wrapper").show();
   			   $(".recommend-wrapper").show();
	    	}else{
	    		weui.alert(r.desc);
	    	}
	    }
	});
}
$("#btn").click(function(){
	 $(".weui-toast__content").text("二维码生成中");
	 $("#loadingToast").fadeIn(100);
	 $.ajax({
	 	type:"post",
	 	url:"../center/createQrcode",
	    data:{
	    	studentId:student.studentId
	    },
	    success:function(r){
	    	$("#loadingToast").hide();
	    	if(r.success){
	    		imgurl = r.data.path;
	    		student.qrcode = imgurl;
	    		localStorage.setItem("student",JSON.stringify(student));
	    		$(".qrcode-wrapper").html(`<div class="qrcode"><img id="qrimg" src="${r.data.path}" alt="" /><p>点击图片放大</p></div>`);
	    		$("#btn").hide();
                getRecord();
	    	}else{
	    		weui.alert(r.desc);
	    	}
	    	$(".weui-toast__content").text("数据加载中");
	    }
	 });
})
$(".qrcode-wrapper").on("click","#qrimg",function(){
	if(student.qrcode){		
		$(".weui-gallery__img").html(`<img src="${student.qrcode}" alt="" />`)
	}else{
		$(".weui-gallery__img").html(`<img src="${imgurl}" alt="" />`)
	}
	$(".weui-gallery").show();
})
$(".weui-gallery").click(function(event){
	var e = window.event || event;
    if(e.target.nodeName=="IMG"){
    	
    }else{    	
    	$(this).hide();
    }
})
