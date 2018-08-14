import '../css/userInfo.css';
//		layui.cache.studentId = 1
		layui.config({
			version : "1"
		}).extend({
			'fly' : 'static/layui/lay/modules/fly/cool'
		});
		layui.use([ 'layer', 'form', 'fly', 'upload' ], function() {
			var layer = layui.layer, form = layui.form, fly = layui.fly, $ = layui.jquery, upload = layui.upload;
            $('body').height($('body')[0].clientHeight);//弹出键盘错位问题	
			$('.bottom-btn').on("touchstart", function() {
				$(this).css("background-color", '#a23872')
			})
			$('.bottom-btn').on("touchend", function() {
				$(this).css("background-color", '#ca1d7b')
				$(this).children('a').trigger('click')
			})

			var student = localStorage.getItem("student")
			if (student) {
				student = JSON.parse(student)
				if (student.perfect) {
					$('input[name="idCardNo"]').val(student.idCardNo)
					$('input[name="university"]').val(student.university)
					$('input[name="idCardPic"]').val(student.idCardPic)
					$('#demo1').attr('src', student.idCardPic)
					$('input').attr('readonly', "readonly")
					$('input').on('focus', function() {
                         $(this).trigger('blur');
                    });
					$('.bottom-btn').addClass('layui-hide')
				} else {
					var loadIndex;
					//普通图片上传
					var uploadInst = upload.render({
						elem : '#test1',
						field : 'img',
						url : '../center/uploadImg',
						before : function(obj) {
							loadIndex = layer.load(1, {
								shade : 0.8
							});
							//预读本地文件示例，不支持ie8
							obj.preview(function(index, file, result) {
								$('#demo1').attr('src', result); //图片链接（base64）
							});
						},
						done : function(res) {
							//如果上传失败
							if (res.code == 0) {
								var imgurl = res.data.url;//获取图片url
								$('input[name="idCardPic"]').val(imgurl);
								layer.msg('上传成功');
							} else {
                                $('input[name="idCardPic"]').val("");
								layer.msg(res.desc)
							}
							layer.close(loadIndex);
						},
						error : function() {
							layer.msg('上传失败')
							layer.close(loadIndex);
						}
					});

					form.on('submit(userinfo-form)', function(data) {
						var action = $(data.form).attr('action'), button = $(data.elem);
						if (!data.field.idCardNo) {
							layer.msg('身份证不能为空')
							return false;
						}
						if (!data.field.university) {
							layer.msg('留学学校不能为空')
							return false;
						}
						if (!data.field.idCardPic) {
							layer.msg('请上传图片')
							return false;
						}
						var student = localStorage.getItem("student")
						student = JSON.parse(student)
						data.field.studentId = student.studentId;
						fly.json(action, data.field, function(res) {
							if (res.code == 0) {
								student.idCardNo = data.field.idCardNo
								student.university = data.field.university
								student.idCardPic = data.field.idCardPic
								student.perfect = true
								localStorage.setItem("student", JSON.stringify(student))
								layer.msg('提交成功')
								setTimeout(function() {
									location.href = 'userInfo-suc.html'
								}, 500)
							} else {
								layer.msg(res.desc)
							}
							;
						});
						return false;
					});
				}
			}
		})