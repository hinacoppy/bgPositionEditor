// BG_position_editor 用 JavaScript
// (C)hinacoppy 2018

//広域変数
var imgpath = './img/';

//入力のXGIDを解析し、結果をボードエディタ、シチュエーションエディタに反映
function gamen_ni_hanei(xgid) {
  xgid = (xgid) ? xgid : "XGID=--------------------------:0:0:1:00:0:0:0:0:10";
  regexp = /XGID=(.+?):(.+?):(.+?):(.+?):(.+?):(.+?):(.+?):(.+?):(.+?):(.+?)$/;
  z = xgid.match(regexp);
  pos=z[1]; cubeval=z[2]; cubeowner=z[3]; turn=z[4]; dice=z[5];
  sc1=z[6]; sc2=z[7]; jacoby=crawford=z[8]; matchlen=z[9]; maxcube=z[10];

  $('#xgid').val(xgid);
  $('#matchlength').val(matchlen);
  $('#score1').val(sc1);
  $('#score2').val(sc2);
  $('#position').val(pos);
  $('#dice').val(dice);
  $('#maxcube').val(maxcube);
  $('#position').val(pos);
  $('#maxcubeval').text(get_maxcubevaltext(maxcube));
  if (matchlen == 0) {
    $('[name=gamemode]').eq(0).prop('checked', true);
    gamemode=$('[name=gamemode]').eq(0).val();
  } else {
    $('[name=gamemode]').eq(1).prop('checked', true);
    gamemode=$('[name=gamemode]').eq(1).val();
  }
  if (gamemode == 'matchgame' && crawford != 0) {
    $('[name=crawford]').eq(1).prop('checked', true);
  } else {
    $('[name=crawford]').eq(0).prop('checked', true);
  }
  switch(cubeowner) {
    case '0':
      $('[name=cubeowner]').eq(1).prop('checked', true);
      break;
    case '1':
      $('[name=cubeowner]').eq(2).prop('checked', true);
      break;
    case '-1':
      $('[name=cubeowner]').eq(0).prop('checked', true);
      break;
  }
  switch(turn) {
    case '1':
      $('[name=turn]').eq(0).prop('checked', true);
      break;
    case '-1':
      $('[name=turn]').eq(1).prop('checked', true);
      break;
  }
  $('[name=jacoby]').eq(jacoby).prop('checked', true);
  $('[name=cubevalue]').val(cubeval);
  position_ni_hanei(pos);
  calc_boff(pos);
}

//ポジションの情報をボードエディタに反映
function position_ni_hanei(position) {
  var poslist = position.split('');
  for (var i=0; i<poslist.length; i++) {
    c = poslist[i];
    pt = ("000"+i).substr(-2);
    if (c == "-") {
      $("#n"+pt).val(0);
      if (i>=1 && i<=24) {
        $('[name=r'+pt+']').val(" ");
      }
    }
    if ( c.match(/[A-Z]/) ) {
      n = c.charCodeAt(0) - "A".charCodeAt(0) + 1;
      $("#n"+pt).val(n);
      if (i>=1 && i<=24) {
        $('[name=r'+pt+']').val("b");
      }
    }
    if ( c.match(/[a-z]/) ) {
      n = c.charCodeAt(0) - "a".charCodeAt(0) + 1;
      $("#n"+pt).val(n);
      if (i>=1 && i<=24) {
        $('[name=r'+pt+']').val("w");
      }
    }
  }
}

//ジャコビーフラグ(クロフォードフラグ)を設定
function check_jb_cf() {
  gm = $('[name=gamemode]:checked').val();
  jb = $('[name=jacoby]:checked').val();
  cf = $('[name=crawford]:checked').val();
  rr = (gm == 'moneygame') ? jb : 0;
  rr = (gm == 'matchgame' && cf == 1) ? 1 : rr;
  return rr;
}

//maxcubeのキューブバリューを計算する
function get_maxcubevaltext(maxcube) {
  val = Math.pow(2, maxcube);
  return '('+val+')'; 
}

//ベアオフの数を計算・表示する。負数の場合は警告(赤文字)
function calc_boff(position) {
  boffw = boffb = 15;
  var poslist = position.split('');
  for (var i=0; i<poslist.length; i++) {
    c = poslist[i];
    if ( c.match(/[A-Z]/) ) {
      n = c.charCodeAt(0) - "A".charCodeAt(0) + 1;
      boffb -= n;
    }
    if ( c.match(/[a-z]/) ) {
      n = c.charCodeAt(0) - "a".charCodeAt(0) + 1;
      boffw -= n;
    }
  }

  $('#boff-b').val(boffb);
  $('#boff-w').val(boffw);
  if (boffb < 0) {
    $('#boff-b').css("color","red").css("font-weight","bold");
  } else {
    $('#boff-b').css("color","initial").css("font-weight","initial");
  }
  if (boffw < 0) {
    $('#boff-w').css("color","red").css("font-weight","bold");
  } else {
    $('#boff-w').css("color","initial").css("font-weight","initial");
  }
}

//ポジションエディタの情報からposition文字列を組み立て
function position_wo_kumitate() {
  posstr = "";
  for (i=0; i<26; i++) {
    pt = ("0000"+ i).substr(-2);
    n = Number($("#n"+pt).val());
    col = $("[name=r"+pt+"]").val();

    if (n==0) {
      posstr += "-";
    } else {
      if (col=="b") {
        ch = String.fromCharCode("A".charCodeAt(0) + n - 1);
        posstr += ch;
      } else if (col=="w") {
        ch = String.fromCharCode("a".charCodeAt(0) + n - 1);
        posstr += ch;
      }
    }
  }
  return posstr;
}

//画面のデータを元にXGIDを組み立て
function xgidout_wo_kumitate() {
  gamemode = $('[name=gamemode]:checked').val();
  cubeval  = $('[name=cubevalue]').val();
  cubeown  = $('[name=cubeowner]:checked').val();
  turn     = $('[name=turn]:checked').val();
  dice     = $('#dice').val();
  sc1      = $('#score1').val();
  sc2      = $('#score2').val();
  jbcf     = check_jb_cf();
  matchlen = $('#matchlength').val();
  maxcube  = $('#maxcube').val();
  pos      = $('#position').val();
  if (gamemode == "moneygame") {
    sc1 = sc2 = matchlen = 0;
  }
  xgidout = 'XGID='+pos+':'+cubeval+':'+cubeown+':'+turn+':'+dice+':'+sc1+':'+sc2+':'+jbcf+':'+matchlen+':'+maxcube;
  return xgidout;
}

//JavaScript処理で、ボード情報を取得する
function js_getboard(xgid,boardtype,imgpath) {
  html = new HtmlBoard(xgid);
  html.imgpath = imgpath;
  html.boardtype = boardtype;
  bgboard = html.get_board_html();
  pipinfo = html.get_pipinfo();
  bdwidth = html.get_bdwidth();
  $('#bgboard').show().html(bgboard).css("width",bdwidth);
  $('#pipinfo').text(pipinfo);
  $("#floatWindow").css({top:320, left:600}).fadeIn("fast");
  draw_canvas();
  setTimeout(function(){ $('#bgboard').hide(); }, 500); //draw_canvas()が終わったころに非表示にする
}

//html2canvasコマンドでHTML画像を一つのpng画像にまとめる
function draw_canvas() {
  html2canvas($("#bgboard")[0], {scale:1.0}).then(function(canvas) {
    //imgタグのsrcの中に、html2canvasがレンダリングした画像を登録する。
    var imgData = canvas.toDataURL();
    $("#boardone")[0].src = imgData;
    $("#downloadimg")[0].href = imgData; //ダウンロードリンクも画像にしておく
  });
}

//イベントハンドラの定義
$(function() {

  //[Apply to Editor] ボタンがクリックされたとき
  $('#apply').on('click', function(e) {
    xgid = $('#xgid').val();
    gamen_ni_hanei(xgid);
  });

  //ゲームシチュエーションが変更されたときはxgid-outを編集する
  $('form[name="BgPositionEditor"]').on('change', function(e) {
    if (e.target.id != "xgid") {
      pos = position_wo_kumitate();
      $('#position').val(pos);
      xgid = xgidout_wo_kumitate();
      $('#xgid').val(xgid);
      calc_boff(pos);
    }
  });

  //[Draw the Board] ボタンがクリックされたとき(CW)
  $('#draw-board').on('click', function(e) {
    xgid = $('#xgid').val();
    js_getboard(xgid,boardtype,imgpath); //boardtype,imgpathは広域変数から取得
  });

  //max cubeが変更されたときは倍率(キューブバリュー)を変更する
  $('#maxcube').on('change', function(e) {
    maxcube  = $('#maxcube').val();
    $('#maxcubeval').text(get_maxcubevaltext(maxcube));
  });

  //[Copy to Clip] ボタンがクリックされたとき
  var clipboard = new Clipboard('#copy2clip');
  clipboard.on('success', function(e) {
    e.clearSelection();
  });

  //[Clear] ボタンがクリックされたとき
  $('#clear').on('click', function(e) {
    $('#xgid').val('').focus();
  });

  //gamemodeが変更されたときは設定不可な項目をグレー表示に
  $('[name=gamemode]').on('change', function(e) {
    gamemode = $('[name=gamemode]:checked').val();
    if (gamemode == "moneygame") { $('.deco_money').css("color", "black"); $('.deco_match').css("color", "gray"); }
    if (gamemode == "matchgame") { $('.deco_money').css("color", "gray");  $('.deco_match').css("color", "black"); }
  });

  //[change to (C)CW] ボタンがクリックされたとき
  $('#alt-rotation').on('click', function(e) {
    xgid = $('#xgid').val();
    url = (boardtype == 'gnu-cw') ? "BG_position_editor_ccw.html" : "BG_position_editor_cw.html";
    window.location.href = url + "?t=" + xgid;
  });

  //HTMLファイル読み込み時にXGIDがクエリが設定されていれば読み込み、画面に反映する
  $(window).on('load',function(){
    ref = $(location).attr('search');
    xgid = ref.slice(ref.indexOf('&t=XGID', 0)+4); //手抜きのクエリ判定
    $('#xgid').val(xgid);
    gamen_ni_hanei(xgid); //XGIDをエディタに反映
    js_getboard(xgid,boardtype,imgpath); //ボード画像を作成
  });

}); //close to $(function() {
