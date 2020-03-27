//jquery.funcHoverDiv.js
//refer to http://webnonotes.com/javascript-2/fake-window/
'use strict';

(function($){
  $.fn.funcHoverDiv = function(userOptions){
    var elements = this;
    var defaults = {hoverid:'',
            dragid:'',
            closeid:'',
            isModal:false,
            width: '300px',
            height: '300px'};

    var option = $.extend(defaults,userOptions);

    $(option.hoverid).css('display', 'none');

    var default_pos_left;
    var default_pos_top;

    $(this).click(function(){
      var win_width = window.innerWidth;
      var win_height = window.innerHeight;
      var $hover = $(option.hoverid);

      $hover.css('display', 'block');
      $hover.css('width', option.width);
      $hover.css('height', option.height);

      default_pos_left = (win_width / 2) - ($hover.width() / 2);
      default_pos_top = (win_height / 2) - ($hover.height() / 2);
      $hover.css('position', 'fixed');
      $hover.css('left', default_pos_left);
      $hover.css('top', default_pos_top);
      $hover.css('z-index', 99);
      if(option.isModal){
        if(!$('#popup-background')[0]){
          var $div = $('<div id="popup-background"></div>');

          $div.css('display', 'block');
          $div.css('position', 'fixed');
          $div.css('top', '0');
          $div.css('left', '0');
          $div.css('height', '100%');
          $div.css('width', '100%');
          $div.css('background', '#000');
          $div.css('opacity', '0.60');
          $div.css('margin', '0');
          $div.css('padding', '0');
          $(document.body).append($div);
        }
        else{
          $('#popup-background').css('display', 'block');
        }
      }
    });

    var down_flg = false;
    $(option.dragid).mousedown(function(e){
      var pagex = e.pageX;
      var pagey = e.pageY;
      var $hover = $(option.hoverid);
      down_flg = true;
      $(document).mousemove(function(e){
        if(!down_flg) return;
        default_pos_left = default_pos_left + (e.pageX - pagex);
        pagex = pagex + e.pageX - pagex;

        default_pos_top = default_pos_top + (e.pageY - pagey);
        pagey = pagey + e.pageY - pagey;

        $hover.css('left', default_pos_left);
        $hover.css('top', default_pos_top);

      }).mouseup(function(){
        $(document).off('mousemove');
        down_flg = false;
      });
    });

    $(option.closeid).click(function(){
      $(option.hoverid).css('display', 'none');
      if(option.isModal){
           $('#popup-background').css('display', 'none');
      }
    });

    return(this);
  };

})(jQuery);
