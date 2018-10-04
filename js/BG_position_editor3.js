// BG_position_editor 用 JavaScript
// (C)hinacoppy 2018

//広域変数
var imgpath = 'img/bw/';
var boardtype = 'gnu-cw';
var durty_analysis = true;
var durty_drawboard = true;

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
  $('#dicer, #dicef').val(dice);
  $('#maxcube').val(maxcube);
  $('#position').val(pos);
  $('#maxcubeval').text('('+get_cubevaltext(maxcube)+')');
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
      $('[name=cubeowner]').eq(0).prop('checked', true);
      break;
    case '1':
      $('[name=cubeowner]').eq(1).prop('checked', true);
      break;
    case '-1':
      $('[name=cubeowner]').eq(2).prop('checked', true);
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
  turn_ni_hanei(turn);
  cube_wo_hyoji(cubeowner, cubeval, gamemode, crawford);
}

//turnによって表示を変更
function turn_ni_hanei(turn) {
  switch(turn) {
    case '1':
      $('.turn0').show(); $('.turn1').hide();
      break;
    case '-1':
      $('.turn1').show(); $('.turn0').hide();
      break;
  }
}

//キューブを表示
function cube_wo_hyoji(cubeown, cubeval, gamemode, crawford) {
  let align, cubestr;

  if (gamemode == 'matchgame' && crawford != 0) {
    cubestr = "Cr";
    align = "middle";
  } else {
    cubestr = get_cubevaltext(cubeval);
    switch(cubeown) {
    case "0":
      align = "middle"; break;
    case "1":
      align = "bottom"; break;
    case "-1":
      align = "top"; break;
    }
  }
  $('#cubef, #cuber').text('['+ cubestr +']');
  $('#cubef, #cuber').attr("valign", align);
}

//ポジションの情報をボードエディタに反映
function position_ni_hanei(position) {
  const poslist = position.split('');
  for (let i=0; i<poslist.length; i++) {
    const ch = poslist[i];
    const pt = ("00"+i).substr(-2);
    const str = make_pt_str(i, ch);
    $('#p'+pt+'f').html(str);
    $('#p'+pt+'r').html(str);
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
function get_cubevaltext(cube) {
  return Math.pow(2, cube); 
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

  $('#boff-bf, #boff-br').text(boffb);
  $('#boff-wf, #boff-wr').text(boffw);
  if (boffb < 0) {
    $('#boff-bf, #boff-br').css("color","red").css("font-weight","bold");
  } else {
    $('#boff-bf, #boff-br').css("color","initial").css("font-weight","initial");
  }
  if (boffw < 0) {
    $('#boff-wf, #boff-wr').css("color","red").css("font-weight","bold");
  } else {
    $('#boff-wf, #boff-wr').css("color","initial").css("font-weight","initial");
  }
}

//クリックされたボタンを元にポジションを編集
function edit_position(id) {
  const pt = Number(id.substr(1,2));
  const updn = id.substr(3,1);
  const delta = updn=='u' ? +1 : updn=='d' ? -1 : 0;

  const position = $('#position').val();
  const poslist = position.split('');
  const ch = poslist[pt];
  const num = char2num(ch);
  const chnew = num2char(num + delta);

  poslist[pt] = chnew;
  const nextpos = poslist.join('');

  $('#position').val(nextpos).change(); //XGIDを編集するためにchangeイベントを発火

  const str = make_pt_str(pt, chnew);
  const pts = ("00"+pt).substr(-2);
  $('#p'+pts+"f").html(str);
  $('#p'+pts+"r").html(str);
  calc_boff(nextpos); //ベアオフを数える
}

//ポイントに表示する駒
function make_pt_str(pt, ch) {
  let ptstr;
  const nm = char2num(ch);
  const checker = nm > 0 ? "●" : "○";
  const absnm = Math.abs(nm);
  checker5 = (absnm >= 6) ? absnm : checker;

  if (absnm == 0) { return ""; }
  if ((pt >= 13 && pt <= 24) || pt == 0) { //ボードの上半分
    if (absnm >= 1) { ptstr = checker; }
    if (absnm >= 2) { ptstr = ptstr + "<br>" + checker; }
    if (absnm >= 3) { ptstr = ptstr + "<br>" + checker; }
    if (absnm >= 4) { ptstr = ptstr + "<br>" + checker; }
    if (absnm >= 5) { ptstr = ptstr + "<br>" + checker5; }
  } else { //ボードの下半分
    if (absnm >= 1) { ptstr = checker; }
    if (absnm >= 2) { ptstr = checker + "<br>" + ptstr; }
    if (absnm >= 3) { ptstr = checker + "<br>" + ptstr; }
    if (absnm >= 4) { ptstr = checker + "<br>" + ptstr; }
    if (absnm >= 5) { ptstr = checker5 + "<br>" + ptstr; }
  }
  return ptstr;
}

//ポジション文字(A-Za-z)を数字に変換
function char2num(c) {
  let n;
  if ( c.match(/[A-Z]/) ) {
    n = c.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
  } else if ( c.match(/[a-z]/) ) {
    n = -1 * (c.charCodeAt(0) - 'a'.charCodeAt(0) + 1);
  } else if (c == '-') {
    n = 0;
  }
  return n;
}

//数字をポジション文字(A-Za-z)に変換
function num2char(n) {
  let c;
  if (n > 0) {
    c = String.fromCharCode("A".charCodeAt(0) + Math.abs(n) - 1);
  } else if (n < 0) {
    c = String.fromCharCode("a".charCodeAt(0) + Math.abs(n) - 1);
  } else { // n == 0
    c = '-';
  }
  return c;
}

//画面のデータを元にXGIDを組み立て
function xgidout_wo_kumitate() {
  const gamemode = $('[name=gamemode]:checked').val();
  const cubeval  = $('[name=cubevalue]').val();
  const cubeown  = $('[name=cubeowner]:checked').val();
  const turn     = $('[name=turn]:checked').val();
  const dice     = $('#dicef').val();
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
  draw_canvas();
  setTimeout(function(){ $('#bgboard').hide(); }, 500); //draw_canvas()が終わったころに非表示にする
  durty_drawboard = false;
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
//    url: 'http://local.example.com:1234/gnubg_ajax.js?g='+gnuid, //Node.js
//    url: 'http://ldap.example.com/cgi-bin/gnubg_ajax.cgi?g='+gnuid,
    url: 'https://v153-127-246-44.vir.kagoya.net:17500/gnubg_ajax.js?g='+gnuid+'&d='+depth, //Node.js
    method: 'GET',
    dataType : "text",
  }).done(function(d) {
    disp_result_pre(d);
    durty_analysis = false;
  }).fail(function() {
    disp_error();
  });
}

//イベントハンドラの定義
$(function() {
  //up/downボタンがクリックされたとき
  $('.updn').on('click', function(e) {
    const id = $(this).attr("id");
    edit_position(id);
  });

  //[Apply to Editor] ボタンがクリックされたとき
  $('#apply').on('click', function(e) {
    const xgid = $('#xgid').val();
    gamen_ni_hanei(xgid);
  });

  //キューブ状態が変更されたときはキューブを表示する
  $('[name=cubeowner], [name=cubevalue]').on('change', function(e) {
    const cubeval  = $('[name=cubevalue]').val();
    const cubeown  = $('[name=cubeowner]:checked').val();
    const gamemode = $('[name=gamemode]:checked').val();
    const crawford = $('[name=crawford]:checked').val();
    cube_wo_hyoji(cubeown, cubeval, gamemode, crawford);
  });


  //turnが変更されたとき
  $('[name=turn]').on('change', function(e) {
    const turn = $('[name=turn]:checked').val();
    turn_ni_hanei(turn);
  });

  //ゲームシチュエーションが変更されたときはxgid-outを編集する
  $('#BgEditor').on('change', function(e) {
    if (e.target.id != "xgid") {
      const xgid = xgidout_wo_kumitate();
      $('#xgid').val(xgid);
      durty_analysis = durty_drawboard = true;
    }
  });

  //[Draw the Board] ボタンがクリックされたとき(CW)
  $('#draw-board').on('click', function(e) {
    if (durty_drawboard) {
      const xgid = $('#xgid').val();
      js_getboard(xgid, boardtype, imgpath); //boardtype,imgpathは広域変数から取得
    }
    $('#boardImg').fadeIn();
  });
  //閉じるボタンクリック
  $('#closeImg').on('click', function(){
    $('#boardImg').fadeOut();
  });

  //max cubeが変更されたときは倍率(キューブバリュー)を変更する
  $('#maxcube').on('change', function(e) {
    const maxcube  = $('#maxcube').val();
    $('#maxcubeval').text('('+get_cubevaltext(maxcube)+')');
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

  //Diceが変更されたとき、反対側のダイスを更新
  $('#dicef, #dicer').on('change', function(e) {
    switch ( $(this).attr('id') ) {
    case 'dicef':
      $('#dicer').val( $(this).val() );
      break;
    case 'dicer':
      $('#dicef').val( $(this).val() );
      break;
    }
  });

  //[change Rotation] ボタンがクリックされたとき
  $('#alt-rotation').on('click', function(e) {
    switch(boardtype) {
    case 'gnu-cw':
      $('.rotation_rev').show(); $('.rotation_fwd').hide();
      boardtype = 'gnu-ccw'
      break;
    case 'gnu-ccw':
      $('.rotation_fwd').show(); $('.rotation_rev').hide();
      boardtype = 'gnu-cw'
      break;
    }
  });

  //[Analyse] ボタンがクリックされたとき
  $('#analyse').on('click', function(e) {
    if (durty_analysis) {
      const xgid = $("#xgid").val();
      const depth = $("[name=depth]").val();
      get_gnuanalysis_ajax(xgid, depth);
    }
    $('#analysisResult').fadeIn();
  });
  //閉じるボタンクリック
  $('#closeResult').on('click', function(e) {
    $('#analysisResult').fadeOut();
  });

}); //close to $(function() {
