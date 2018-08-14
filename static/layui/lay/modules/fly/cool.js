layui.define(['layer', 'laytpl', 'form', 'element', 'upload', 'util'], function(exports){

    var $ = layui.jquery
        ,layer = layui.layer
        ,laytpl = layui.laytpl
        ,form = layui.form
        ,element = layui.element
        ,upload = layui.upload
        ,util = layui.util
        ,device = layui.device()
        ,DISABLED = 'layui-btn-disabled';

    layui.focusInsert = function(obj, str){
        var result, val = obj.value;
        obj.focus();
        if(document.selection){ //ie
            result = document.selection.createRange();
            document.selection.empty();
            result.text = str;
        } else {
            result = [val.substring(0, obj.selectionStart), str, val.substr(obj.selectionEnd)];
            obj.focus();
            obj.value = result.join('');
        }
    };

    //数字前置补零
    layui.laytpl.digit = function(num, length, end){
        var str = '';
        num = String(num);
        length = length || 2;
        for(var i = num.length; i < length; i++){
            str += '0';
        }
        return num < Math.pow(10, length) ? str + (num|0) : num;
    };

    var fly = {

        dir: layui.cache.host + 'static/layui/lay/modules/fly/' //模块路径

        //Ajax
        ,json: function(url, data, success, options){
            var that = this, type = typeof data === 'function';

            if(type){
                options = success
                success = data;
                data = {};
            }

            options = options || {};

            return $.ajax({
                type: options.type || 'post',
                dataType: options.dataType || 'json',
                data: data,
                url: url,
                success: function(res){
                    if(res.code === 0) {
                        success && success(res);
                    } else {
                        layer.msg(res.desc || res.code, {shift: 6});
                        options.error && options.error();
                    }
                }, error: function(e){
                    layer.msg('请求异常，请重试', {shift: 6});
                    options.error && options.error(e);
                }
            });
        }

        //计算字符长度
        ,charLen: function(val){
            var arr = val.split(''), len = 0;
            for(var i = 0; i <  val.length ; i++){
                arr[i].charCodeAt(0) < 299 ? len++ : len += 2;
            }
            return len;
        }

        ,form: {}
    };

    //加载扩展模块
    layui.config({
        base: fly.dir
    })


    //表单提交
    form.on('submit(*)', function(data){
        var action = $(data.form).attr('action'), button = $(data.elem);
        fly.json(action, data.field, function(res){
            if(res.code == 0){
                layer.msg('登录成功')
            }else if(res.code == 1){
                layer.msg(res.desc)
            }else {
                layer.msg(res.desc)
            };
        });
        return false;
    });

    //加载特定模块
    if(layui.cache.page && layui.cache.page !== 'index'){
        var extend = {};
        extend[layui.cache.page] = layui.cache.page;
        layui.extend(extend);
        layui.use(layui.cache.page);
    }

    console.log(fly.dir)

    exports('fly', fly);

});

