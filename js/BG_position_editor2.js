// BG_position_editor 用 JavaScript
// (C)hinacoppy 2018

//広域変数
var imgpath = 'img/';

//入力のXGIDを解析し、結果をボードエディタ、シチュエーションエディタに反映
function gamen_ni_hanei(xgid) {
  const xgidstr = (xgid) ? xgid : "XGID=--------------------------:0:0:1:00:0:0:0:0:10";
  const regexp = /XGID=(.+?):(.+?):(.+?):(.+?):(.+?):(.+?):(.+?):(.+?):(.+?):(.+?)$/;
  const z = xgidstr.match(regexp);
  const pos=z[1], cubeval=z[2], cubeowner=z[3], turn=z[4], dice=z[5],
        sc1=z[6], sc2=z[7], jacoby=crawford=z[8], matchlen=z[9], maxcube=z[10];
  let gamemode;

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
  gamemode_css(gamemode);
}

//ポジションの情報をボードエディタに反映
function position_ni_hanei(position) {
  const poslist = position.split('');
  let n;
  for (let i=0; i<poslist.length; i++) {
    const c = poslist[i];
    const pt = ("000"+i).substr(-2);
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
  const gm = $('[name=gamemode]:checked').val();
  const jb = $('[name=jacoby]:checked').val();
  const cf = $('[name=crawford]:checked').val();
  const rr = (gm == 'moneygame') ? jb : 0;
  const rs = (gm == 'matchgame' && cf == 1) ? 1 : rr;
  return rs;
}

//maxcubeのキューブバリューを計算する
function get_maxcubevaltext(maxcube) {
  return '('+Math.pow(2, maxcube)+')'; 
}

//ベアオフの数を計算・表示する。負数の場合は警告(赤文字)
function calc_boff(position) {
  let boffw = boffb = 15;
  let n;
  const poslist = position.split('');
  for (let i=0; i<poslist.length; i++) {
    const c = poslist[i];
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
  let posstr = "";
  let ch;
  for (let i=0; i<26; i++) {
    const pt = ("0000"+ i).substr(-2);
    const n = Number($("#n"+pt).val());
    const col = $("[name=r"+pt+"]").val();

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
  const gamemode = $('[name=gamemode]:checked').val();
  const cubeval  = $('[name=cubevalue]').val();
  const cubeown  = $('[name=cubeowner]:checked').val();
  const turn     = $('[name=turn]:checked').val();
  const dice     = $('#dice').val();
  let   sc1      = $('#score1').val();
  let   sc2      = $('#score2').val();
  const jbcf     = check_jb_cf();
  let   matchlen = $('#matchlength').val();
  const maxcube  = $('#maxcube').val();
  const pos      = $('#position').val();
  if (gamemode == "moneygame") {
    sc1 = sc2 = matchlen = 0;
  }
  const xgidout = 'XGID='+pos+':'+cubeval+':'+cubeown+':'+turn+':'+dice+':'+sc1+':'+sc2+':'+jbcf+':'+matchlen+':'+maxcube;
  return xgidout;
}

//JavaScript処理で、ボード情報を取得する
function js_getboard(xgid, boardtype, imgpath) {
  const html = new HtmlBoard(xgid);
  html.imgpath = imgpath;
  html.boardtype = boardtype;
  const bgboard = html.get_board_html();
  const pipinfo = html.get_pipinfo();
  const bdwidth = html.get_bdwidth();
  $('#bgboard').show().html(bgboard).css("width", bdwidth);
  $('#pipinfo').text(pipinfo);
  $("#floatWindow").css({top:320, left:600}).fadeIn("fast");
  draw_canvas();
  setTimeout(function(){ $('#bgboard').hide(); }, 500); //draw_canvas()が終わったころに非表示にする
}

//html2canvasコマンドでHTML画像を一つのpng画像にまとめる
function draw_canvas() {
  html2canvas($("#bgboard")[0], {scale:1.0}).then(function(canvas) {
    //imgタグのsrcの中に、html2canvasがレンダリングした画像を登録する。
    const imgData = canvas.toDataURL();
    $("#boardone")[0].src = imgData;
    $("#downloadimg")[0].href = imgData; //ダウンロードリンクも画像にしておく
  });
}

function gamemode_css(gamemode) {
  if (gamemode == "moneygame") { $('.deco_money').css("color", "black"); $('.deco_match').css("color", "gray"); }
  if (gamemode == "matchgame") { $('.deco_money').css("color", "gray");  $('.deco_match').css("color", "black"); }
}

//AJAXエラー時のメッセージ
function disp_error() {
  $("#result").text("Error: AJAX connection failed");
}

//結果を<pre>で表示
function disp_result_pre(d) {
  $("#result").text(d);
}

//AJAX通信により、gnubgによる解析結果を取得する
function get_gnuanalysis_ajax(gnuid, depth) {
  $("#result").html("<img src='img/loading.gif'>");
  $.ajax({
//    url: 'gnubg_ajax.php?g='+gnuid+'&d='+depth, //local PHP script
//    url: 'http://ldap.example.com/cgi-bin/gnubg_ajax.cgi?g='+gnuid,
    url: 'https://v153-127-246-44.vir.kagoya.net:17500/gnubg_ajax.js?g='+gnuid+'&d='+depth, //Node.js
    method: 'GET',
    dataType : "text",
  }).done(function(d) {
    disp_result_pre(d);
  }).fail(function() {
    disp_error();
//    alert('データ取得に失敗しました');
  });
}

//イベントハンドラの定義
$(function() {

  //[Apply to Editor] ボタンがクリックされたとき
  $('#apply').on('click', function(e) {
    const xgid = $('#xgid').val();
    gamen_ni_hanei(xgid);
  });

  //ゲームシチュエーションが変更されたときはxgid-outを編集する
  $('form[name="BgPositionEditor"]').on('change', function(e) {
    if (e.target.id != "xgid") {
      const pos = position_wo_kumitate();
      $('#position').val(pos);
      const xgid = xgidout_wo_kumitate();
      $('#xgid').val(xgid);
      calc_boff(pos);
    }
  });

  //[Draw the Board] ボタンがクリックされたとき(CW)
  $('#draw-board').on('click', function(e) {
    const xgid = $('#xgid').val();
    js_getboard(xgid, boardtype, imgpath); //boardtype,imgpathは広域変数から取得
  });

  //max cubeが変更されたときは倍率(キューブバリュー)を変更する
  $('#maxcube').on('change', function(e) {
    const maxcube  = $('#maxcube').val();
    $('#maxcubeval').text(get_maxcubevaltext(maxcube));
  });

  //[XGID to Clipboard] ボタンがクリックされたとき
  const clipboard = new ClipboardJS('#copy2clip');
  clipboard.on('success', function(e) {
    e.clearSelection();
  });

  //[Clear] ボタンがクリックされたとき
  $('#clear').on('click', function(e) {
    $('#xgid').val('').focus();
  });

  //gamemodeが変更されたときは設定不可な項目をグレー表示に
  $('[name=gamemode]').on('change', function(e) {
    const gamemode = $('[name=gamemode]:checked').val();
    gamemode_css(gamemode);
  });

  //[change to (C)CW] ボタンがクリックされたとき
  $('#alt-rotation').on('click', function(e) {
    const xgid = $('#xgid').val();
    const url = (boardtype == 'gnu-cw') ? "BG_position_editor_ccw.html" : "BG_position_editor_cw.html";
    window.location.href = url + "?t=" + xgid;
  });

  //HTMLファイル読み込み時にXGIDがクエリが設定されていれば読み込み、画面に反映する
  $(window).on('load',function(){
    const ref = $(location).attr('search');
    let xgid = ref.slice(ref.indexOf('&t=XGID', 0)+4); //手抜きのクエリ判定
    if (xgid === "") { xgid = "XGID=--------------------------:0:0:1:00:0:0:0:0:10";}
    $('#xgid').val(xgid);
    gamen_ni_hanei(xgid); //XGIDをエディタに反映
    js_getboard(xgid,boardtype,imgpath); //ボード画像を作成
  });

  //[Analyse] ボタンがクリックされたとき
  $('#analyse').on('click', function(e) {
    const xgid = $("#xgid").val();
    const depth = $("[name=depth]").val();
    get_gnuanalysis_ajax(xgid, depth);
  });

}); //close to $(function() {
