//フローティングウィンドウに対するJS定義
//参考：http://ascii.jp/elem/000/000/478/478300/
$(function(){

    $("#floatWindow").data("maxHeight", $("#floatWindow").height())
                     .data("minHeight", $("#floatWindow dl dt").height());

    $("#floatWindow .close").on('click', function(){
        $("#floatWindow").fadeOut("fast");
    });
    $("#floatWindow .max").on('click', function(){
        $("#floatWindow dd").slideDown("fast");
        $("#floatWindow").css("height", $("#floatWindow").data("maxHeight")+"px")
    });
    $("#floatWindow .min").on('click', function(){
        $("#floatWindow dd").slideUp("fast");
        $("#floatWindow").css("height", $("#floatWindow").data("minHeight")+"px")
    });

    $("#floatWindow dl dt").on('mousedown', function(e){

        $("#floatWindow")
            .data("clickPointX" , e.pageX - $("#floatWindow").offset().left)
            .data("clickPointY" , e.pageY - $("#floatWindow").offset().top);

        $(document).on('mousemove', function(e){
            $("#floatWindow").css({
                top:e.pageY  - $("#floatWindow").data("clickPointY")+"px",
                left:e.pageX - $("#floatWindow").data("clickPointX")+"px"
            })
        });

    }).on('mouseup', function(){
        $(document).unbind('mousemove')
    });

});
