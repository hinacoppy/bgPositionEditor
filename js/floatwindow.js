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


$(function(){

    $("#floatWindow2").data("maxHeight", $("#floatWindow2").height())
                     .data("minHeight", $("#floatWindow2 dl dt").height());

    $("#floatWindow2 .close").on('click', function(){
        $("#floatWindow2").fadeOut("fast");
    });
    $("#floatWindow2 .max").on('click', function(){
        $("#floatWindow2 dd").slideDown("fast");
        $("#floatWindow2").css("height", $("#floatWindow2").data("maxHeight")+"px")
    });
    $("#floatWindow2 .min").on('click', function(){
        $("#floatWindow2 dd").slideUp("fast");
        $("#floatWindow2").css("height", $("#floatWindow2").data("minHeight")+"px")
    });

    $("#floatWindow2 dl dt").on('mousedown', function(e){

        $("#floatWindow2")
            .data("clickPointX" , e.pageX - $("#floatWindow2").offset().left)
            .data("clickPointY" , e.pageY - $("#floatWindow2").offset().top);

        $(document).on('mousemove', function(e){
            $("#floatWindow2").css({
                top:e.pageY  - $("#floatWindow2").data("clickPointY")+"px",
                left:e.pageX - $("#floatWindow2").data("clickPointX")+"px"
            })
        });

    }).on('mouseup', function(){
        $(document).unbind('mousemove')
    });

});
